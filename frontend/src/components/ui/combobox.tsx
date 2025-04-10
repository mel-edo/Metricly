import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "../../lib/utils"
import { Button } from "./button"

export type ComboboxOption = {
  value: string
  label: string
}

interface ComboboxProps {
  options: ComboboxOption[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function Combobox({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  className,
}: ComboboxProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [searchTerm, setSearchTerm] = React.useState('')

  // Filter options based on search term
  const filteredOptions = React.useMemo(() => {
    if (!searchTerm) return options
    return options.filter(option =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [options, searchTerm])

  // Handle option selection
  const handleSelect = (optionValue: string) => {
    onChange(optionValue)
    setIsOpen(false)
    setSearchTerm('')
  }

  // Handle click outside to close dropdown
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('.combobox-container')) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className={`relative combobox-container ${className}`}>
      {/* Trigger button */}
      <Button
        type="button"
        variant="outline"
        role="combobox"
        aria-expanded={isOpen}
        className="w-full justify-between h-10 px-3 py-2 bg-metricly-secondary border-metricly-secondary text-text hover:border-metricly-accent focus:border-metricly-accent"
        onClick={() => setIsOpen(!isOpen)}
      >
        {value ? options.find(option => option.value === value)?.label : placeholder}
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-metricly-background border border-metricly-secondary rounded-md shadow-md">
          {/* Search input */}
          <div className="p-2">
            <input
              type="text"
              className="w-full px-3 py-2 text-sm bg-metricly-secondary border border-metricly-secondary rounded-md text-text placeholder:text-muted-foreground focus:outline-none focus:border-metricly-accent"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* Options list */}
          <div className="max-h-[200px] overflow-y-auto py-1">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-sm text-muted-foreground text-center">
                No options found
              </div>
            ) : (
              filteredOptions.map(option => (
                <div
                  key={option.value}
                  className={`px-3 py-2 text-sm cursor-pointer hover:bg-metricly-accent/20 flex items-center ${value === option.value ? 'bg-metricly-accent/30' : ''}`}
                  onClick={() => handleSelect(option.value)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span className="text-text">{option.label}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
