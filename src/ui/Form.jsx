import { createContext, forwardRef, useContext, useId } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '../lib/cn'

/** `Form.Group` oʻz `controlId` sini ichkaridagi label/inputga uzatadi. */
const FieldContext = createContext(null)

const controlBase =
  'w-full rounded-lg border border-line bg-surface text-fg placeholder:text-subtle ' +
  'shadow-[inset_0_1px_0_oklch(1_0_0_/_0.03)] transition-[border-color,box-shadow,background-color] duration-150 ' +
  'outline-none focus:border-primary focus:ring-4 focus:ring-[var(--ring)] ' +
  'disabled:cursor-not-allowed disabled:bg-surface-2 disabled:text-subtle ' +
  'read-only:bg-surface-2'

const controlSizes = {
  sm: 'h-8 px-2.5 text-xs',
  md: 'h-9 px-3 text-[13px]',
  lg: 'h-11 px-4 text-sm',
}

function Form({ className, children, onSubmit, ...props }) {
  return (
    <form
      noValidate
      onSubmit={onSubmit ?? ((e) => e.preventDefault())}
      className={cn('w-full', className)}
      {...props}
    >
      {children}
    </form>
  )
}

function FormGroup({ controlId, className, children, ...props }) {
  const generated = useId()
  const id = controlId || generated
  return (
    <FieldContext.Provider value={{ id }}>
      <div className={cn('w-full', className)} {...props}>
        {children}
      </div>
    </FieldContext.Provider>
  )
}

function FormLabel({ className, children, htmlFor, ...props }) {
  const field = useContext(FieldContext)
  return (
    <label
      htmlFor={htmlFor || field?.id}
      className={cn(
        'mb-1.5 block text-xs font-medium text-muted select-none',
        className,
      )}
      {...props}
    >
      {children}
    </label>
  )
}

const FormControl = forwardRef(function FormControl(
  { as, type = 'text', size = 'md', isInvalid, className, rows, ...props },
  ref,
) {
  const field = useContext(FieldContext)
  const Component = as || 'input'
  const isTextarea = Component === 'textarea'

  return (
    <Component
      ref={ref}
      id={props.id || field?.id}
      type={isTextarea ? undefined : type}
      rows={isTextarea ? rows || 3 : undefined}
      aria-invalid={isInvalid || undefined}
      className={cn(
        controlBase,
        isTextarea
          ? 'min-h-20 resize-y px-3 py-2 text-[13px] leading-relaxed'
          : (controlSizes[size] ?? controlSizes.md),
        type === 'file' &&
          'cursor-pointer py-0 file:mr-3 file:h-full file:cursor-pointer file:border-0 file:border-r file:border-line file:bg-surface-2 file:px-3 file:text-xs file:font-medium file:text-fg',
        isInvalid &&
          'border-danger focus:border-danger focus:ring-[oklch(0.585_0.215_20_/_0.25)]',
        className,
      )}
      {...props}
    />
  )
})

const FormSelect = forwardRef(function FormSelect(
  { size = 'md', isInvalid, className, children, ...props },
  ref,
) {
  const field = useContext(FieldContext)
  return (
    <div className="relative w-full">
      <select
        ref={ref}
        id={props.id || field?.id}
        aria-invalid={isInvalid || undefined}
        className={cn(
          controlBase,
          controlSizes[size] ?? controlSizes.md,
          'cursor-pointer appearance-none pr-9',
          isInvalid && 'border-danger focus:border-danger',
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-subtle"
        aria-hidden="true"
      />
    </div>
  )
})

/** Bezatilgan checkbox / radio. `type="switch"` esa toggle koʻrinishini beradi. */
const FormCheck = forwardRef(function FormCheck(
  { type = 'checkbox', label, className, id, checked, defaultChecked, ...props },
  ref,
) {
  const field = useContext(FieldContext)
  const generated = useId()
  const inputId = id || field?.id || generated
  const isSwitch = type === 'switch'
  const inputType = isSwitch ? 'checkbox' : type

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className="relative inline-flex shrink-0 items-center">
        <input
          ref={ref}
          id={inputId}
          type={inputType}
          checked={checked}
          defaultChecked={defaultChecked}
          className={cn(
            'peer cursor-pointer appearance-none border border-line-strong bg-surface transition-colors duration-150',
            'checked:border-primary checked:bg-primary',
            'focus-visible:ring-4 focus-visible:ring-[var(--ring)] focus-visible:outline-none',
            'disabled:cursor-not-allowed disabled:opacity-50',
            isSwitch
              ? 'h-5 w-9 rounded-full'
              : type === 'radio'
                ? 'size-4 rounded-full'
                : 'size-4 rounded-[5px]',
          )}
          {...props}
        />
        {type === 'checkbox' && (
          <Check
            className="pointer-events-none absolute left-0 top-0 size-4 scale-75 p-px text-primary-fg opacity-0 transition peer-checked:scale-100 peer-checked:opacity-100"
            strokeWidth={3.5}
            aria-hidden="true"
          />
        )}
        {type === 'radio' && (
          <span className="pointer-events-none absolute left-1/2 top-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-fg opacity-0 transition peer-checked:opacity-100" />
        )}
        {isSwitch && (
          <span className="pointer-events-none absolute left-0.5 top-1/2 size-4 -translate-y-1/2 rounded-full bg-surface shadow-soft transition-transform duration-200 peer-checked:translate-x-4" />
        )}
      </span>
      {label != null && (
        <label
          htmlFor={inputId}
          className="cursor-pointer select-none text-xs text-muted"
        >
          {label}
        </label>
      )}
    </div>
  )
})

function FormText({ className, children, ...props }) {
  return (
    <p className={cn('mt-1.5 text-[11px] leading-snug text-subtle', className)} {...props}>
      {children}
    </p>
  )
}

/**
 * Bir necha boshqaruvni yonma-yon bitta maydonga birlashtiradi: ichki
 * burchaklar tekislanadi va faqat tashqi chekkalar yumaloq qoladi.
 */
function InputGroup({ className, children, ...props }) {
  return (
    <div
      className={cn(
        'flex w-full items-stretch',
        '[&>*]:rounded-none [&>*:first-child]:rounded-l-lg [&>*:last-child]:rounded-r-lg',
        '[&>*:not(:first-child)]:-ml-px [&>*:focus-within]:relative [&>*:focus]:relative',
        '[&>div>select]:rounded-none',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

function InputGroupText({ className, children, ...props }) {
  return (
    <span
      className={cn(
        'inline-flex items-center border border-line bg-surface-2 px-3 text-xs text-muted',
        className,
      )}
      {...props}
    >
      {children}
    </span>
  )
}

InputGroup.Text = InputGroupText

Form.Group = FormGroup
Form.Label = FormLabel
Form.Control = FormControl
Form.Select = FormSelect
Form.Check = FormCheck
Form.Text = FormText

export default Form
export { Form, InputGroup, FormControl, FormSelect, FormCheck, FormLabel }
