import {
  type ChangeEvent,
  type FormEvent,
  type KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/Button'
import { Modal } from '../components/Modal'
import {
  buildOrderEmailBody,
  buildOrderEmailTitles,
  fileToCompressedImage,
  sendOrderEmail,
  type OrderEmailAttachment,
} from '../services/orderEmailService'
import { createOrder, deleteOrder } from '../services/orderStorage'
import type { ItemType } from '../types/order'

const itemTypes: ItemType[] = [
  'Sapato',
  'Bolsa',
  'Cinto',
  'Jaqueta',
  'Artigo religioso',
  'Artesanato',
  'Outro',
]
const serviceSuggestions = [
  'Troca de sola',
  'Troca de salto',
  'Troca de zíper',
  'Costura',
  'Reforma de couro',
  'Ajuste de cinto',
  'Limpeza e hidratação',
  'Restauração de artigo religioso',
  'Pintura e acabamento artesanal',
  'Reparo em peça de artesanato',
  'Colagem ou reconstituição de peça',
]

interface FormState {
  customerName: string
  phone: string
  itemType: ItemType | ''
  service: string
  description: string
  imageBase64List: string[]
}

const initialState: FormState = {
  customerName: '',
  phone: '',
  itemType: '',
  service: '',
  description: '',
  imageBase64List: [],
}

const DRAFT_STORAGE_KEY = 'sapataria-bebedouro-new-order-draft'

interface DraftState {
  form: Omit<FormState, 'imageBase64List'>
}

type ToastState = {
  message: string
  type: 'error' | 'success'
}

type ImageOptimizationState = {
  originalSizeMB: string
  optimizedSizeMB: string
  reductionPercent: number
}

function isItemType(value: unknown): value is ItemType {
  return itemTypes.includes(value as ItemType)
}

function readDraftState(): DraftState | null {
  try {
    const rawDraft = localStorage.getItem(DRAFT_STORAGE_KEY)
    if (!rawDraft) {
      return null
    }

    const parsed = JSON.parse(rawDraft) as Partial<DraftState>
    const parsedForm = (parsed.form ?? {}) as Partial<FormState>

    return {
      form: {
        customerName: typeof parsedForm.customerName === 'string' ? parsedForm.customerName : '',
        phone: typeof parsedForm.phone === 'string' ? parsedForm.phone : '',
        itemType: isItemType(parsedForm.itemType) ? parsedForm.itemType : initialState.itemType,
        service: typeof parsedForm.service === 'string' ? parsedForm.service : '',
        description: typeof parsedForm.description === 'string' ? parsedForm.description : '',
      },
    }
  } catch {
    return null
  }
}

function hasDraftContent(form: FormState) {
  return Boolean(
    form.customerName.trim()
      || form.phone.trim()
      || form.service.trim()
      || form.description.trim()
      || form.itemType !== initialState.itemType,
  )
}

function saveDraftState(form: FormState) {
  if (!hasDraftContent(form)) {
    localStorage.removeItem(DRAFT_STORAGE_KEY)
    return
  }

  const draft: DraftState = {
    form: {
      customerName: form.customerName,
      phone: form.phone,
      itemType: form.itemType,
      service: form.service,
      description: form.description,
    },
  }

  try {
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft))
  } catch {
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY)
    } catch {
      // Sem localStorage disponivel, o formulario segue funcionando sem rascunho.
    }
  }
}

function clearDraftState() {
  localStorage.removeItem(DRAFT_STORAGE_KEY)
}

export function NewOrder() {
  const [form, setForm] = useState<FormState>(() => {
    const draft = readDraftState()
    return draft ? { ...draft.form, imageBase64List: [] } : initialState
  })
  const [createdOrderCode, setCreatedOrderCode] = useState<string | null>(null)
  const [imageNames, setImageNames] = useState<string[]>([])
  const [imageAttachments, setImageAttachments] = useState<OrderEmailAttachment[]>([])
  const [imageOptimization, setImageOptimization] = useState<ImageOptimizationState | null>(null)
  const [toast, setToast] = useState<ToastState | null>(null)
  const [showImageError, setShowImageError] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const nameRef = useRef<HTMLInputElement>(null)
  const phoneRef = useRef<HTMLInputElement>(null)
  const itemTypeRef = useRef<HTMLSelectElement>(null)
  const serviceRef = useRef<HTMLInputElement>(null)
  const descriptionRef = useRef<HTMLTextAreaElement>(null)
  const uploadBoxRef = useRef<HTMLDivElement>(null)
  const cameraButtonRef = useRef<HTMLButtonElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)
  const submitRef = useRef<HTMLButtonElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    nameRef.current?.focus()
  }, [])

  useEffect(() => {
    saveDraftState(form)
  }, [form])

  useEffect(() => {
    if (!toast) {
      return
    }

    const timer = window.setTimeout(() => {
      setToast(null)
    }, 4200)

    return () => window.clearTimeout(timer)
  }, [toast])

  function updateField(field: keyof FormState, value: string | string[]) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function focusNext(next?: HTMLElement | null) {
    window.setTimeout(() => next?.focus(), 0)
  }

  function handleNextKey(event: KeyboardEvent<HTMLElement>, next?: HTMLElement | null) {
    if (event.key !== 'Enter') {
      return
    }
    event.preventDefault()
    focusNext(next)
  }

  function showToast(message: string, type: ToastState['type']) {
    setToast({ message, type })
  }

  function revealInvalidField(
    field: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement,
    message: string,
  ) {
    const target = field.closest('label') ?? field
    const headerOffset = 150
    const top = target.getBoundingClientRect().top + window.scrollY - headerOffset

    setShowImageError(false)
    showToast(message, 'error')
    window.scrollTo({ top: Math.max(top, 0), behavior: 'smooth' })
    window.setTimeout(() => {
      field.focus({ preventScroll: true })
    }, 260)
  }

  function revealMissingImage() {
    const target = uploadBoxRef.current
    const headerOffset = 150
    const top = target ? target.getBoundingClientRect().top + window.scrollY - headerOffset : 0

    setShowImageError(true)
    showToast('Anexe pelo menos uma foto do item para enviar o orçamento.', 'error')
    window.scrollTo({ top: Math.max(top, 0), behavior: 'smooth' })
    window.setTimeout(() => {
      cameraButtonRef.current?.focus({ preventScroll: true })
    }, 260)
  }

  function getFirstInvalidField() {
    const orderedFields = [
      {
        field: nameRef.current,
        isInvalid: !form.customerName.trim(),
        message: 'Informe o nome do cliente.',
      },
      {
        field: phoneRef.current,
        isInvalid: !form.phone.trim(),
        message: 'Informe o WhatsApp para retorno.',
      },
      {
        field: itemTypeRef.current,
        isInvalid: !form.itemType,
        message: 'Selecione o tipo de item.',
      },
      {
        field: serviceRef.current,
        isInvalid: !form.service.trim(),
        message: 'Informe o serviço desejado.',
      },
      {
        field: descriptionRef.current,
        isInvalid: !form.description.trim(),
        message: 'Descreva o problema do item.',
      },
    ]

    return orderedFields.find((item) => item.field && item.isInvalid) ?? null
  }

  function clearImageInputs() {
    if (cameraInputRef.current) {
      cameraInputRef.current.value = ''
    }
    if (galleryInputRef.current) {
      galleryInputRef.current.value = ''
    }
  }

  function clearSelectedImage() {
    updateField('imageBase64List', [])
    setImageNames([])
    setImageAttachments([])
    setImageOptimization(null)
    clearImageInputs()
  }

  function openCamera() {
    if (cameraInputRef.current) {
      cameraInputRef.current.value = ''
      cameraInputRef.current.click()
    }
  }

  function openGallery() {
    if (galleryInputRef.current) {
      galleryInputRef.current.value = ''
      galleryInputRef.current.click()
    }
  }

  function handleImage(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? [])
    if (!files.length) {
      return
    }

    fileToCompressedImage(files[0])
      .then((compressedImage) => {
        updateField('imageBase64List', [compressedImage.attachment.contentBase64])
        setImageNames([compressedImage.attachment.filename])
        setImageAttachments([compressedImage.attachment])
        setImageOptimization({
          originalSizeMB: compressedImage.originalSizeMB,
          optimizedSizeMB: compressedImage.optimizedSizeMB,
          reductionPercent: compressedImage.reductionPercent,
        })
        setShowImageError(false)
        setToast(null)
        focusNext(submitRef.current)
      })
      .catch(() => {
        clearImageInputs()
        setShowImageError(true)
        showToast('Não foi possível preparar a imagem. Tente tirar outra foto ou escolher uma imagem da galeria.', 'error')
      })
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isSubmitting) {
      return
    }

    const invalidField = getFirstInvalidField()

    if (invalidField?.field) {
      revealInvalidField(invalidField.field, invalidField.message)
      return
    }

    if (!form.imageBase64List.length || !imageAttachments.length) {
      revealMissingImage()
      return
    }

    setIsSubmitting(true)
    const order = createOrder({
      customerName: form.customerName.trim(),
      phone: form.phone.trim(),
      itemType: form.itemType as ItemType,
      service: form.service.trim(),
      description: form.description.trim(),
      imageBase64: form.imageBase64List[0],
      imageBase64List: form.imageBase64List,
    })

    try {
      const attachments = imageAttachments
      const imageBase64 = attachments[0]?.contentBase64
      const emailTitles = buildOrderEmailTitles(order.customerName)
      const emailBody = buildOrderEmailBody({
        orderCode: order.code,
        customerName: order.customerName,
        phone: order.phone,
        itemType: order.itemType,
        serviceDescription: order.service,
        problemDescription: order.description,
      })

      await sendOrderEmail({
        orderCode: order.code,
        customerName: order.customerName,
        phone: order.phone,
        itemType: order.itemType,
        subject: emailTitles.subject,
        title: emailTitles.title,
        messageTitle: emailTitles.title,
        emailSubject: emailTitles.subject,
        emailTitle: emailTitles.title,
        emailBody,
        formattedMessage: emailBody,
        serviceDescription: order.service,
        problemDescription: order.description,
        attachments,
        ...(imageBase64 ? { imageBase64 } : {}),
      })

      deleteOrder(order.id)
      setCreatedOrderCode(order.code)
      setShowImageError(false)
      showToast('Orçamento enviado com sucesso.', 'success')
      clearDraftState()
      setForm(initialState)
      clearSelectedImage()
    } catch (error) {
      deleteOrder(order.id)
      showToast(
        error instanceof Error
          ? error.message
          : 'Não foi possível enviar o orçamento. Tente novamente em alguns instantes.',
        'error',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  function closeConfirmation() {
    setCreatedOrderCode(null)
    navigate('/')
    window.setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }, 0)
  }

  return (
    <main className="page-shell">
      <section className="form-page">
        <div className="section-heading">
          <p className="eyebrow">🧾 Novo orçamento</p>
          <h1>Solicitar orçamento</h1>
          <p>
            Preencha os dados e anexe pelo menos uma foto da parte que precisa de conserto
            ou restauração. Depois envie o resumo para a sapataria avaliar e responder.
          </p>
        </div>

        <form
          className="form-grid"
          noValidate
          onSubmit={handleSubmit}
        >
          <label>
            Nome do cliente
            <input
              name="Nome do cliente"
              ref={nameRef}
              required
              value={form.customerName}
              onChange={(event) => updateField('customerName', event.target.value)}
              onKeyDown={(event) => handleNextKey(event, phoneRef.current)}
              placeholder="Ex.: Maria Aparecida"
            />
          </label>

          <label>
            WhatsApp
            <input
              name="WhatsApp para retorno"
              ref={phoneRef}
              required
              inputMode="numeric"
              pattern="[0-9]*"
              value={form.phone}
              onChange={(event) => updateField('phone', event.target.value.replace(/\D/g, ''))}
              onKeyDown={(event) => handleNextKey(event, itemTypeRef.current)}
              placeholder="Ex.: 17999999999"
            />
          </label>

          <label>
            Tipo de item
            <select
              name="Tipo de item"
              ref={itemTypeRef}
              value={form.itemType}
              onChange={(event) => updateField('itemType', event.target.value as ItemType | '')}
              onKeyDown={(event) => handleNextKey(event, serviceRef.current)}
            >
              <option value="" disabled>Selecione o tipo de item</option>
              {itemTypes.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>

          <label>
            Serviço desejado
            <input
              name="Serviço desejado"
              ref={serviceRef}
              required
              list="services"
              value={form.service}
              onChange={(event) => updateField('service', event.target.value)}
              onKeyDown={(event) => handleNextKey(event, descriptionRef.current)}
              placeholder="Ex.: Trocar zíper, restaurar imagem religiosa"
            />
            <datalist id="services">
              {serviceSuggestions.map((service) => (
                <option key={service} value={service} />
              ))}
            </datalist>
          </label>

          <label className="form-grid__wide">
            Descrição do serviço
            <textarea
              name="Descrição do serviço"
              ref={descriptionRef}
              required
              rows={4}
              value={form.description}
              onChange={(event) => updateField('description', event.target.value)}
              onKeyDown={(event) => handleNextKey(event, cameraButtonRef.current)}
              placeholder="Conte o que necessita ser feito."
            />
          </label>

          <div
            className={`upload-box form-grid__wide ${showImageError ? 'upload-box--error' : ''}`.trim()}
            ref={uploadBoxRef}
          >
            <strong>Fotos do item</strong>
            <p>
              Tire fotos do item e da região que precisa de conserto ou restauração. Exemplo:
              sola descolada, zíper da bolsa, costura aberta, imagem religiosa danificada.
            </p>
            <div className="upload-actions">
              <button
                className="button button--secondary upload-box__button"
                ref={cameraButtonRef}
                type="button"
                onClick={openCamera}
              >
                📷 Tirar Foto
              </button>
              <button
                className="button button--secondary upload-box__button"
                type="button"
                onClick={openGallery}
              >
                🖼️ Escolher da Galeria
              </button>
            </div>
            <input
              ref={cameraInputRef}
              accept="image/*"
              capture="environment"
              hidden
              type="file"
              onChange={handleImage}
            />
            <input
              ref={galleryInputRef}
              accept="image/*"
              hidden
              type="file"
              onChange={handleImage}
            />
            {imageNames.length ? <small>{imageNames.length} foto(s) selecionada(s)</small> : null}
            {imageOptimization ? (
              <div className="image-optimization" aria-live="polite">
                <span>Imagem original: {imageOptimization.originalSizeMB} MB</span>
                <span>Imagem otimizada: {imageOptimization.optimizedSizeMB} MB</span>
                <span>Redução: {imageOptimization.reductionPercent}%</span>
              </div>
            ) : null}
            {form.imageBase64List.length ? (
              <div className="photo-preview-grid" aria-label="Prévia das fotos selecionadas">
                {form.imageBase64List.map((image, index) => (
                  <figure key={`${imageNames[index] ?? 'foto'}-${index}`}>
                    <img src={image} alt={`Prévia ${index + 1}`} />
                    <figcaption>{imageNames[index] ?? `Foto ${index + 1}`}</figcaption>
                    <button
                      className="button button--ghost photo-preview-grid__remove-text"
                      type="button"
                      onClick={clearSelectedImage}
                    >
                      🗑️ Remover Foto
                    </button>
                  </figure>
                ))}
              </div>
            ) : null}
          </div>

          <div className="form-actions form-grid__wide">
            <Button ref={submitRef} disabled={isSubmitting} type="submit">
              {isSubmitting ? 'Enviando...' : '✨ Gerar pedido'}
            </Button>
          </div>
        </form>
      </section>

      {toast ? (
        <div className={`toast toast--${toast.type}`} role="alert">
          {toast.message}
        </div>
      ) : null}

      {isSubmitting ? (
        <div className="sending-overlay" role="status" aria-live="polite" aria-label="Enviando solicitação">
          <div className="sending-overlay__panel">
            <span className="hammer-emoji sending-overlay__hammer" aria-hidden="true">🔨</span>
            <strong>Enviando solicitação</strong>
            <p>Preparando os dados e avisando a sapataria.</p>
          </div>
        </div>
      ) : null}

      {createdOrderCode ? (
        <Modal
          title={`Pedido gerado: ${createdOrderCode}`}
          onClose={closeConfirmation}
        >
          <p className="notice">
            ✏️ Anote o código <strong>{createdOrderCode}</strong> para consultar sua solicitação depois.
            O orçamento foi enviado para a sapataria. Aguarde o retorno com a avaliação.
          </p>
        </Modal>
      ) : null}
    </main>
  )
}
