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
import { buildOrderEmailUrl } from '../services/email'
import { createOrder } from '../services/orderStorage'
import type { ItemType, Order } from '../types/order'

const itemTypes: ItemType[] = ['Sapato', 'Bolsa', 'Cinto', 'Jaqueta', 'Outro']
const serviceSuggestions = [
  'Troca de sola',
  'Troca de salto',
  'Troca de ziper',
  'Costura',
  'Reforma de couro',
  'Ajuste de cinto',
  'Limpeza e hidratacao',
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

export function NewOrder() {
  const [form, setForm] = useState<FormState>(initialState)
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null)
  const [imageNames, setImageNames] = useState<string[]>([])
  const nameRef = useRef<HTMLInputElement>(null)
  const phoneRef = useRef<HTMLInputElement>(null)
  const itemTypeRef = useRef<HTMLSelectElement>(null)
  const serviceRef = useRef<HTMLInputElement>(null)
  const descriptionRef = useRef<HTMLTextAreaElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const submitRef = useRef<HTMLButtonElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    nameRef.current?.focus()
  }, [])

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

  function revealInvalidField(field: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement) {
    const target = field.closest('label') ?? field
    const headerOffset = 150
    const top = target.getBoundingClientRect().top + window.scrollY - headerOffset

    window.scrollTo({ top: Math.max(top, 0), behavior: 'smooth' })
    window.setTimeout(() => {
      field.focus({ preventScroll: true })
      field.reportValidity()
    }, 260)
  }

  function getFirstInvalidField() {
    const orderedFields = [
      nameRef.current,
      phoneRef.current,
      serviceRef.current,
      descriptionRef.current,
    ]

    return orderedFields.find((field) => field && !field.checkValidity()) ?? null
  }

  function handleImage(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? [])
    if (!files.length) {
      updateField('imageBase64List', [])
      setImageNames([])
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
      focusNext(submitRef.current)
    })
  }

  function removeImage(indexToRemove: number) {
    updateField(
      'imageBase64List',
      form.imageBase64List.filter((_, index) => index !== indexToRemove),
    )
    setImageNames((current) => current.filter((_, index) => index !== indexToRemove))
    if (fileRef.current) {
      fileRef.current.value = ''
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const invalidField = getFirstInvalidField()

    if (invalidField) {
      revealInvalidField(invalidField)
      return
    }

    const order = createOrder({
      customerName: form.customerName.trim(),
      phone: form.phone.trim(),
      itemType: form.itemType,
      service: form.service.trim(),
      description: form.description.trim(),
      imageBase64: form.imageBase64List[0],
      imageBase64List: form.imageBase64List.length ? form.imageBase64List : undefined,
    })
    setCreatedOrder(order)
    setForm(initialState)
    setImageNames([])
    if (fileRef.current) {
      fileRef.current.value = ''
    }
  }

  return (
    <main className="page-shell">
      <section className="form-page">
        <div className="section-heading">
          <p className="eyebrow">🧾 Novo orçamento</p>
          <h1>Solicitar orçamento</h1>
          <p>
            Preencha o essencial e, se puder, anexe uma foto da parte que precisa de conserto.
            Depois envie o resumo por email para a sapataria avaliar e responder.
          </p>
        </div>

        <form className="form-grid" noValidate onSubmit={handleSubmit}>
          <label>
            Nome do cliente
            <input
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
            Servico desejado
            <input
              ref={serviceRef}
              required
              list="services"
              value={form.service}
              onChange={(event) => updateField('service', event.target.value)}
              onKeyDown={(event) => handleNextKey(event, descriptionRef.current)}
              placeholder="Ex.: Trocar ziper"
            />
            <datalist id="services">
              {serviceSuggestions.map((service) => (
                <option key={service} value={service} />
              ))}
            </datalist>
          </label>

          <label className="form-grid__wide">
            Descricao do problema
            <textarea
              ref={descriptionRef}
              required
              rows={4}
              value={form.description}
              onChange={(event) => updateField('description', event.target.value)}
              onKeyDown={(event) => handleNextKey(event, fileRef.current)}
              placeholder="Conte o que aconteceu, onde esta o problema e se existe alguma urgencia."
            />
          </label>

          <div className="upload-box form-grid__wide">
            <strong>Fotos do item</strong>
            <p>
              Tire fotos do item e da regiao que precisa de conserto. Exemplo: sola descolada, salto
              quebrado, ziper da bolsa, costura aberta.
            </p>
            <label className="button button--secondary upload-box__button" htmlFor="order-images">
              📷 Buscar imagem
            </label>
            <input
              id="order-images"
              ref={fileRef}
              accept="image/*"
              className="upload-box__input"
              multiple
              type="file"
              onChange={handleImage}
            />
            {imageNames.length ? <small>{imageNames.length} foto(s) selecionada(s)</small> : null}
            {form.imageBase64List.length ? (
              <div className="photo-preview-grid" aria-label="Previa das fotos selecionadas">
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
                    <img src={image} alt={`Previa ${index + 1}`} />
                    <figcaption>{imageNames[index] ?? `Foto ${index + 1}`}</figcaption>
                  </figure>
                ))}
              </div>
            ) : null}
          </div>

          <div className="form-actions form-grid__wide">
            <Button ref={submitRef} type="submit">✨ Gerar pedido</Button>
          </div>
        </form>
      </section>

      {createdOrder ? (
        <Modal
          title={`Pedido gerado: ${createdOrder.code}`}
          onClose={() => setCreatedOrder(null)}
          actions={
            <>
              <a className="button button--primary" href={buildOrderEmailUrl(createdOrder)} target="_blank">
                ✉️ Enviar orçamento por email
              </a>
              <Button variant="secondary" onClick={() => navigate('/consultar')}>
                🔎 Ver status do pedido
              </Button>
            </>
          }
        >
          <div className="summary-list">
            <p><strong>Cliente:</strong> {createdOrder.customerName}</p>
            <p><strong>Item:</strong> {createdOrder.itemType}</p>
            <p><strong>Servico:</strong> {createdOrder.service}</p>
            <p><strong>Descricao:</strong> {createdOrder.description}</p>
          </div>
          <p className="notice">
            O email sera aberto com o resumo preenchido. Se voce selecionou fotos, anexe as imagens
            no email antes de enviar.
          </p>
        </Modal>
      ) : null}
    </main>
  )
}
