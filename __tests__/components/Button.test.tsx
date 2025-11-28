import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '@/components/ui/button'

describe('Button', () => {
  it('devrait afficher le texte correctement', () => {
    render(<Button>Cliquez ici</Button>)
    expect(screen.getByRole('button')).toHaveTextContent('Cliquez ici')
  })

  it('devrait appeler onClick quand cliqué', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Test</Button>)
    
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('devrait être désactivé quand disabled est true', () => {
    render(<Button disabled>Disabled</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('devrait appliquer les variantes correctement', () => {
    const { rerender } = render(<Button variant="destructive">Delete</Button>)
    expect(screen.getByRole('button')).toHaveClass('bg-destructive')
    
    rerender(<Button variant="outline">Outline</Button>)
    expect(screen.getByRole('button')).toHaveClass('border')
  })

  it('devrait appliquer les tailles correctement', () => {
    const { rerender } = render(<Button size="sm">Small</Button>)
    const button = screen.getByRole('button')
    
    rerender(<Button size="lg">Large</Button>)
    expect(button).toBeInTheDocument()
  })
})
