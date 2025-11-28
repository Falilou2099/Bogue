import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'

describe('UI Components', () => {
  describe('Button', () => {
    it('devrait rendre un bouton avec du texte', () => {
      render(<Button>Cliquez ici</Button>)
      
      const button = screen.getByRole('button', { name: /cliquez ici/i })
      expect(button).toBeInTheDocument()
    })

    it('devrait appeler onClick quand cliqué', () => {
      const handleClick = jest.fn()
      render(<Button onClick={handleClick}>Cliquer</Button>)
      
      const button = screen.getByRole('button')
      fireEvent.click(button)
      
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('devrait être désactivé quand disabled est true', () => {
      render(<Button disabled>Bouton désactivé</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
    })

    it('devrait appliquer la variante default par défaut', () => {
      render(<Button>Bouton</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-primary')
    })

    it('devrait appliquer la variante destructive', () => {
      render(<Button variant="destructive">Supprimer</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-destructive')
    })

    it('devrait appliquer la variante outline', () => {
      render(<Button variant="outline">Outline</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('border')
    })

    it('devrait appliquer la taille sm', () => {
      render(<Button size="sm">Petit</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('h-8')
    })

    it('devrait appliquer la taille lg', () => {
      render(<Button size="lg">Grand</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('h-10')
    })
  })

  describe('Input', () => {
    it('devrait rendre un champ input', () => {
      render(<Input placeholder="Entrez du texte" />)
      
      const input = screen.getByPlaceholderText(/entrez du texte/i)
      expect(input).toBeInTheDocument()
    })

    it('devrait accepter une valeur', () => {
      render(<Input value="Test" readOnly />)
      
      const input = screen.getByDisplayValue('Test')
      expect(input).toBeInTheDocument()
    })

    it('devrait appeler onChange quand la valeur change', () => {
      const handleChange = jest.fn()
      render(<Input onChange={handleChange} />)
      
      const input = screen.getByRole('textbox')
      fireEvent.change(input, { target: { value: 'Nouveau texte' } })
      
      expect(handleChange).toHaveBeenCalled()
    })

    it('devrait être désactivé quand disabled est true', () => {
      render(<Input disabled />)
      
      const input = screen.getByRole('textbox')
      expect(input).toBeDisabled()
    })

    it('devrait accepter un type différent', () => {
      const { container } = render(<Input type="password" />)
      
      const input = container.querySelector('input[type="password"]')
      expect(input).toHaveAttribute('type', 'password')
    })
  })

  describe('Badge', () => {
    it('devrait rendre un badge avec du texte', () => {
      render(<Badge>Nouveau</Badge>)
      
      expect(screen.getByText('Nouveau')).toBeInTheDocument()
    })

    it('devrait appliquer la variante default par défaut', () => {
      const { container } = render(<Badge>Badge</Badge>)
      
      const badge = container.firstChild
      expect(badge).toHaveClass('bg-primary')
    })

    it('devrait appliquer la variante secondary', () => {
      const { container } = render(<Badge variant="secondary">Badge</Badge>)
      
      const badge = container.firstChild
      expect(badge).toHaveClass('bg-secondary')
    })

    it('devrait appliquer la variante destructive', () => {
      const { container } = render(<Badge variant="destructive">Badge</Badge>)
      
      const badge = container.firstChild
      expect(badge).toHaveClass('bg-destructive')
    })

    it('devrait appliquer la variante outline', () => {
      const { container } = render(<Badge variant="outline">Badge</Badge>)
      
      const badge = container.firstChild
      expect(badge).toHaveClass('border')
    })
  })

  describe('Card', () => {
    it('devrait rendre une carte complète', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Titre de la carte</CardTitle>
            <CardDescription>Description de la carte</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Contenu de la carte</p>
          </CardContent>
        </Card>
      )
      
      expect(screen.getByText('Titre de la carte')).toBeInTheDocument()
      expect(screen.getByText('Description de la carte')).toBeInTheDocument()
      expect(screen.getByText('Contenu de la carte')).toBeInTheDocument()
    })

    it('devrait appliquer les classes CSS correctes', () => {
      const { container } = render(
        <Card>
          <CardContent>Contenu</CardContent>
        </Card>
      )
      
      const card = container.firstChild
      expect(card).toHaveClass('rounded-xl', 'border')
    })

    it('devrait rendre sans CardHeader', () => {
      render(
        <Card>
          <CardContent>Contenu uniquement</CardContent>
        </Card>
      )
      
      expect(screen.getByText('Contenu uniquement')).toBeInTheDocument()
    })

    it('devrait rendre sans CardDescription', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Titre seulement</CardTitle>
          </CardHeader>
        </Card>
      )
      
      expect(screen.getByText('Titre seulement')).toBeInTheDocument()
    })
  })
})
