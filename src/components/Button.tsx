import {
  forwardRef,
  type ButtonHTMLAttributes,
  type MouseEventHandler,
  type ReactNode,
} from 'react'
import { Link } from 'react-router-dom'

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost'

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'> {
  children: ReactNode
  onClick?: MouseEventHandler<HTMLElement>
  variant?: ButtonVariant
  to?: string
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { children, onClick, variant = 'primary', to, className = '', ...props },
  ref,
) {
  const classes = `button button--${variant} ${className}`.trim()

  if (to) {
    return (
      <Link className={classes} to={to} onClick={onClick as MouseEventHandler<HTMLAnchorElement>}>
        {children}
      </Link>
    )
  }

  return (
    <button
      className={classes}
      ref={ref}
      type="button"
      onClick={onClick as MouseEventHandler<HTMLButtonElement>}
      {...props}
    >
      {children}
    </button>
  )
})
