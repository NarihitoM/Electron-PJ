import * as CollapsiblePrimitive from "@radix-ui/react-collapsible"

const Collapsible = CollapsiblePrimitive.Root

function CollapsibleTrigger({ ...props }: CollapsiblePrimitive.CollapsibleTriggerProps) {
  return (
    <CollapsiblePrimitive.Trigger 
      data-slot="collapsible-trigger" 
      {...props} 
    />
  )
}

function CollapsibleContent({ ...props }: CollapsiblePrimitive.CollapsibleContentProps) {
  return (
    <CollapsiblePrimitive.Content 
      data-slot="collapsible-content" 
      {...props} 
    />
  )
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent }