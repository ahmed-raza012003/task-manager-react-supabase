import * as RadixSwitch from '@radix-ui/react-switch'

export function Switch({ checked, onCheckedChange }: { checked: boolean; onCheckedChange: (checked: boolean) => void }) {
  return (
    <RadixSwitch.Root
      checked={checked}
      onCheckedChange={onCheckedChange}
      className="relative h-5 w-9 shrink-0 rounded-full bg-inset transition-colors data-[state=checked]:bg-accent focus-visible:outline-none focus-visible:shadow-[var(--ring-accent)]"
    >
      <RadixSwitch.Thumb className="block h-4 w-4 translate-x-0.5 rounded-full bg-white shadow transition-transform data-[state=checked]:translate-x-[18px]" />
    </RadixSwitch.Root>
  )
}
