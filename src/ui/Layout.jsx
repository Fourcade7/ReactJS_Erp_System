import { cn } from '../lib/cn'

/* Tailwind sinf nomlarini statik yozish shart — ular manba matnidan skanerlanadi. */
const SPAN = {
  base: [
    '',
    'col-span-1',
    'col-span-2',
    'col-span-3',
    'col-span-4',
    'col-span-5',
    'col-span-6',
    'col-span-7',
    'col-span-8',
    'col-span-9',
    'col-span-10',
    'col-span-11',
    'col-span-12',
  ],
  sm: [
    '',
    'sm:col-span-1',
    'sm:col-span-2',
    'sm:col-span-3',
    'sm:col-span-4',
    'sm:col-span-5',
    'sm:col-span-6',
    'sm:col-span-7',
    'sm:col-span-8',
    'sm:col-span-9',
    'sm:col-span-10',
    'sm:col-span-11',
    'sm:col-span-12',
  ],
  md: [
    '',
    'md:col-span-1',
    'md:col-span-2',
    'md:col-span-3',
    'md:col-span-4',
    'md:col-span-5',
    'md:col-span-6',
    'md:col-span-7',
    'md:col-span-8',
    'md:col-span-9',
    'md:col-span-10',
    'md:col-span-11',
    'md:col-span-12',
  ],
  lg: [
    '',
    'lg:col-span-1',
    'lg:col-span-2',
    'lg:col-span-3',
    'lg:col-span-4',
    'lg:col-span-5',
    'lg:col-span-6',
    'lg:col-span-7',
    'lg:col-span-8',
    'lg:col-span-9',
    'lg:col-span-10',
    'lg:col-span-11',
    'lg:col-span-12',
  ],
  xl: [
    '',
    'xl:col-span-1',
    'xl:col-span-2',
    'xl:col-span-3',
    'xl:col-span-4',
    'xl:col-span-5',
    'xl:col-span-6',
    'xl:col-span-7',
    'xl:col-span-8',
    'xl:col-span-9',
    'xl:col-span-10',
    'xl:col-span-11',
    'xl:col-span-12',
  ],
}

const GAP = {
  0: 'gap-0',
  1: 'gap-1',
  2: 'gap-2',
  3: 'gap-3',
  4: 'gap-4',
  5: 'gap-5',
  6: 'gap-6',
}

/** Sahifaning markazlashgan, cheklangan kengliqdagi oʻrami. */
function Container({ size = 'app', className, children, ...props }) {
  const widths = {
    sm: 'max-w-xl',
    md: 'max-w-3xl',
    lg: 'max-w-5xl',
    app: 'max-w-[1200px]',
    wide: 'max-w-[1440px]',
    // Butun ekran kengligi — sidebar chap chetga yopishadi.
    full: 'max-w-none',
  }
  return (
    <div
      className={cn('mx-auto w-full px-4 sm:px-6', widths[size] ?? widths.app, className)}
      {...props}
    >
      {children}
    </div>
  )
}

/** 12 ustunli grid qatori. */
function Row({ gap = 3, className, children, ...props }) {
  return (
    <div className={cn('grid grid-cols-12', GAP[gap] ?? GAP[3], className)} {...props}>
      {children}
    </div>
  )
}

/**
 * Grid ustuni. Standart holat — mobil ekranda toʻliq kenglik; kerakli
 * kengliklar `xs`/`sm`/`md`/`lg`/`xl` proplari orqali 12 ustunli shkalada beriladi.
 */
function Col({ xs, sm, md, lg, xl, className, children, ...props }) {
  return (
    <div
      className={cn(
        'col-span-12',
        xs && SPAN.base[xs],
        sm && SPAN.sm[sm],
        md && SPAN.md[md],
        lg && SPAN.lg[lg],
        xl && SPAN.xl[xl],
        'min-w-0',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

/** Asosiy sirt — panel/karta. */
function Card({ as: Component = 'div', padded = true, hoverable = false, className, children, ...props }) {
  return (
    <Component
      className={cn(
        'rounded-card border border-line bg-surface shadow-soft',
        padded && 'p-4',
        hoverable && 'transition-shadow duration-200 hover:shadow-raised',
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  )
}

function CardHeader({ className, children, ...props }) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

function CardBody({ className, children, ...props }) {
  return (
    <div className={cn('p-4', className)} {...props}>
      {children}
    </div>
  )
}

function CardTitle({ className, children, ...props }) {
  return (
    <h3 className={cn('text-sm font-semibold text-fg', className)} {...props}>
      {children}
    </h3>
  )
}

function CardSubtitle({ className, children, ...props }) {
  return (
    <p className={cn('text-xs text-subtle', className)} {...props}>
      {children}
    </p>
  )
}

function CardText({ className, children, ...props }) {
  return (
    <p className={cn('text-[13px] text-muted', className)} {...props}>
      {children}
    </p>
  )
}

Card.Header = CardHeader
Card.Body = CardBody
Card.Title = CardTitle
Card.Subtitle = CardSubtitle
Card.Text = CardText

/** Bo'lim sarlavhasi: chapda nom va izoh, oʻngda amallar. */
function PageHeader({ title, description, icon: Icon, actions, className, ...props }) {
  return (
    <div
      className={cn('mb-4 flex flex-wrap items-start justify-between gap-3', className)}
      {...props}
    >
      <div className="flex min-w-0 items-start gap-2.5">
        {Icon && (
          <span className="mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-line bg-surface-2 text-primary">
            <Icon className="size-4" />
          </span>
        )}
        <div className="min-w-0">
          <h2 className="truncate text-base font-semibold tracking-tight text-fg">{title}</h2>
          {description && <p className="mt-0.5 text-xs text-subtle">{description}</p>}
        </div>
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}

export { Container, Row, Col, Card, PageHeader }
export default Container
