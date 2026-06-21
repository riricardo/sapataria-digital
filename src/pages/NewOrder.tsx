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
  fileToBase64,
  sendOrderEmail,
} from '../services/orderEmailService'
import { createOrder, deleteOrder } from '../services/orderStorage'
import type { ItemType, Order } from '../types/order'

const itemTypes: ItemType[] = ['Sapato', 'Bolsa', 'Cinto', 'Jaqueta', 'Outro']
const serviceSuggestions = [
  'Troca de sola',
  'Troca de salto',
  'Troca de zíper',
  'Costura',
  'Reforma de couro',
  'Ajuste de cinto',
  'Limpeza e hidratação',
]

interface FormState {
  customerName: string
  phone: string
  itemType: ItemType
  service: string
  description: string
  imageBase64List: string[]
}

const initialState: FormState = {
  customerName: '',
  phone: '',
  itemType: 'Sapato',
  service: '',
  description: '',
  imageBase64List: [],
}

type ToastState = {
  message: string
  type: 'error' | 'success'
}

export function NewOrder() {
  const [form, setForm] = useState<FormState>(initialState)
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null)
  const [imageNames, setImageNames] = useState<string[]>([])
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [toast, setToast] = useState<ToastState | null>(null)
  const [showImageError, setShowImageError] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const nameRef = useRef<HTMLInputElement>(null)
  const phoneRef = useRef<HTMLInputElement>(null)
  const itemTypeRef = useRef<HTMLSelectElement>(null)
  const serviceRef = useRef<HTMLInputElement>(null)
  const descriptionRef = useRef<HTMLTextAreaElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const uploadBoxRef = useRef<HTMLDivElement>(null)
  const uploadButtonRef = useRef<HTMLLabelElement>(null)
  const submitRef = useRef<HTMLButtonElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    nameRef.current?.focus()
  }, [])

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

    if (target) {
      const top = target.getBoundingClientRect().top + window.scrollY - headerOffset
      window.scrollTo({ top: Math.max(top, 0), behavior: 'smooth' })
    }

    setShowImageError(true)
    showToast('Adicione pelo menos uma foto do item para solicitar o orçamento.', 'error')
    window.setTimeout(() => uploadButtonRef.current?.focus({ preventScroll: true }), 260)
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

  function handleImage(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? [])
    if (!files.length) {
      updateField('imageBase64List', [])
      setImageNames([])
      setImageFiles([])
      return
    }

    Promise.all(
      files.map(
        (file) =>
          new Promise<string>((resolve) => {
            const reader = new FileReader()
            reader.onload = () => resolve(String(reader.result ?? ''))
            reader.readAsDataURL(file)
          }),
      ),
    ).then((images) => {
      updateField('imageBase64List', images)
      setImageNames(files.map((file) => file.name))
      setImageFiles(files)
      setShowImageError(false)
      setToast(null)
      focusNext(submitRef.current)
    })
  }

  function removeImage(indexToRemove: number) {
    updateField(
      'imageBase64List',
      form.imageBase64List.filter((_, index) => index !== indexToRemove),
    )
    setImageNames((current) => current.filter((_, index) => index !== indexToRemove))
    setImageFiles((current) => current.filter((_, index) => index !== indexToRemove))
    if (fileRef.current) {
      fileRef.current.value = ''
    }
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

    if (!form.imageBase64List.length) {
      revealMissingImage()
      return
    }

    setIsSubmitting(true)
    const order = createOrder({
      customerName: form.customerName.trim(),
      phone: form.phone.trim(),
      itemType: form.itemType,
      service: form.service.trim(),
      description: form.description.trim(),
    })

    try {
      const imageBase64 = imageFiles[0] ? await fileToBase64(imageFiles[0]) : form.imageBase64List[0]
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
        ...(imageBase64 ? { imageBase64 } : {}),
      })

      setCreatedOrder(order)
      setShowImageError(false)
      showToast('Orçamento enviado com sucesso.', 'success')
      setForm(initialState)
      setImageNames([])
      setImageFiles([])
      if (fileRef.current) {
        fileRef.current.value = ''
      }
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
    setCreatedOrder(null)
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
            Preencha o essencial e anexe pelo menos uma foto da parte que precisa de conserto.
            Depois envie o resumo para a sapataria avaliar e responder.
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
              onChange={(event) => updateField('itemType', event.target.value as ItemType)}
              onKeyDown={(event) => handleNextKey(event, serviceRef.current)}
            >
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
              placeholder="Ex.: Trocar zíper"
            />
            <datalist id="services">
              {serviceSuggestions.map((service) => (
                <option key={service} value={service} />
              ))}
            </datalist>
          </label>

          <label className="form-grid__wide">
            Descrição do problema
            <textarea
              name="Descrição do problema"
              ref={descriptionRef}
              required
              rows={4}
              value={form.description}
              onChange={(event) => updateField('description', event.target.value)}
              onKeyDown={(event) => handleNextKey(event, fileRef.current)}
              placeholder="Conte o que aconteceu, onde está o problema e se existe alguma urgência."
            />
          </label>

          <div
            className={`upload-box form-grid__wide ${showImageError ? 'upload-box--error' : ''}`.trim()}
            ref={uploadBoxRef}
          >
            <strong>Fotos do item</strong>
            <p>
              Tire fotos do item e da região que precisa de conserto. Exemplo: sola descolada, salto
              quebrado, zíper da bolsa, costura aberta.
            </p>
            <label
              className="button button--secondary upload-box__button"
              htmlFor="order-images"
              ref={uploadButtonRef}
              tabIndex={0}
            >
              📷 Buscar imagem
            </label>
            <input
              id="order-images"
              name="attachment"
              ref={fileRef}
              accept="image/*"
              className="upload-box__input"
              multiple
              type="file"
              onChange={handleImage}
            />
            {imageNames.length ? <small>{imageNames.length} foto(s) selecionada(s)</small> : null}
            {form.imageBase64List.length ? (
              <div className="photo-preview-grid" aria-label="Prévia das fotos selecionadas">
                {form.imageBase64List.map((image, index) => (
                  <figure key={`${imageNames[index] ?? 'foto'}-${index}`}>
                    <button
                      aria-label={`Remover foto ${index + 1}`}
                      className="photo-preview-grid__remove"
                      type="button"
                      onClick={() => removeImage(index)}
                    >
                      <svg aria-hidden="true" viewBox="0 0 20 20">
                        <path d="m5.5 5.5 9 9m0-9-9 9" />
                      </svg>
                    </button>
                    <img src={image} alt={`Prévia ${index + 1}`} />
                    <figcaption>{imageNames[index] ?? `Foto ${index + 1}`}</figcaption>
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

      {createdOrder ? (
        <Modal
          title={`Pedido gerado: ${createdOrder.code}`}
          onClose={closeConfirmation}
        >
          <div className="summary-list">
            <p><strong>Cliente:</strong> {createdOrder.customerName}</p>
            <p><strong>Item:</strong> {createdOrder.itemType}</p>
            <p><strong>Serviço:</strong> {createdOrder.service}</p>
            <p><strong>Descrição:</strong> {createdOrder.description}</p>
          </div>
          <p className="notice">
            O orçamento foi enviado para a sapataria. Aguarde o retorno com a avaliação.
          </p>
        </Modal>
      ) : null}
    </main>
  )
}
