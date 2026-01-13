import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { LocationChangePrompt } from './LocationChangePrompt'

// Mock dependencies
vi.mock('@/lib/data/prayerTimes', () => ({
  getDistrictById: vi.fn((id: string) => {
    const districts: Record<string, { id: string; name: string; zone: string }> = {
      colombo: { id: 'colombo', name: 'Colombo', zone: '01' },
      kandy: { id: 'kandy', name: 'Kandy', zone: '07' },
      galle: { id: 'galle', name: 'Galle', zone: '12' },
    }
    return districts[id]
  }),
}))

describe('LocationChangePrompt', () => {
  const defaultProps = {
    promptDistrictId: 'kandy',
    currentNotificationDistrict: 'colombo',
    onAccept: vi.fn(() => Promise.resolve(true)),
    onDismiss: vi.fn(),
    isLoading: false,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('renders the prompt with correct text', () => {
      render(<LocationChangePrompt {...defaultProps} />)

      expect(screen.getByText('Update notification location?')).toBeInTheDocument()
    })

    it('shows the new district name', () => {
      render(<LocationChangePrompt {...defaultProps} />)

      expect(screen.getByText('Kandy')).toBeInTheDocument()
    })

    it('shows the current notification district', () => {
      render(<LocationChangePrompt {...defaultProps} />)

      expect(screen.getByText('Colombo')).toBeInTheDocument()
    })

    it('renders Keep current button', () => {
      render(<LocationChangePrompt {...defaultProps} />)

      expect(screen.getByRole('button', { name: /keep current/i })).toBeInTheDocument()
    })

    it('renders Use [district] button', () => {
      render(<LocationChangePrompt {...defaultProps} />)

      expect(screen.getByRole('button', { name: /use kandy/i })).toBeInTheDocument()
    })

    it('renders dismiss button', () => {
      render(<LocationChangePrompt {...defaultProps} />)

      expect(screen.getByRole('button', { name: /dismiss/i })).toBeInTheDocument()
    })

    it('returns null for invalid district', () => {
      const { container } = render(
        <LocationChangePrompt {...defaultProps} promptDistrictId="invalid" />
      )

      expect(container.firstChild).toBeNull()
    })
  })

  describe('interactions', () => {
    it('calls onDismiss when Keep current is clicked', () => {
      render(<LocationChangePrompt {...defaultProps} />)

      fireEvent.click(screen.getByRole('button', { name: /keep current/i }))

      expect(defaultProps.onDismiss).toHaveBeenCalled()
    })

    it('calls onDismiss when X button is clicked', () => {
      render(<LocationChangePrompt {...defaultProps} />)

      fireEvent.click(screen.getByRole('button', { name: /dismiss/i }))

      expect(defaultProps.onDismiss).toHaveBeenCalled()
    })

    it('calls onAccept when Use [district] is clicked', async () => {
      render(<LocationChangePrompt {...defaultProps} />)

      fireEvent.click(screen.getByRole('button', { name: /use kandy/i }))

      await waitFor(() => {
        expect(defaultProps.onAccept).toHaveBeenCalled()
      })
    })
  })

  describe('loading state', () => {
    it('shows Updating... text when loading', () => {
      render(<LocationChangePrompt {...defaultProps} isLoading={true} />)

      expect(screen.getByText('Updating...')).toBeInTheDocument()
    })

    it('disables buttons when loading', () => {
      render(<LocationChangePrompt {...defaultProps} isLoading={true} />)

      expect(screen.getByRole('button', { name: /keep current/i })).toBeDisabled()
      expect(screen.getByRole('button', { name: /updating/i })).toBeDisabled()
    })
  })

  describe('without current notification district', () => {
    it('renders without current district info', () => {
      render(
        <LocationChangePrompt
          {...defaultProps}
          currentNotificationDistrict={null}
        />
      )

      expect(screen.getByText("You're viewing")).toBeInTheDocument()
      expect(screen.getByText('Kandy')).toBeInTheDocument()
      expect(screen.queryByText('but receiving notifications for')).not.toBeInTheDocument()
    })
  })
})
