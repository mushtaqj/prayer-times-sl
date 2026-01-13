import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { NotificationEnableModal } from './NotificationEnableModal'

// Mock dependencies
vi.mock('@/lib/data/prayerTimes', () => ({
  districts: [
    { id: 'colombo', name: 'Colombo', zone: '01' },
    { id: 'kandy', name: 'Kandy', zone: '07' },
    { id: 'galle', name: 'Galle', zone: '12' },
  ],
  getDistrictById: vi.fn((id: string) => {
    const districts: Record<string, { id: string; name: string; zone: string }> = {
      colombo: { id: 'colombo', name: 'Colombo', zone: '01' },
      kandy: { id: 'kandy', name: 'Kandy', zone: '07' },
      galle: { id: 'galle', name: 'Galle', zone: '12' },
    }
    return districts[id]
  }),
}))

describe('NotificationEnableModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onEnable: vi.fn(() => Promise.resolve(true)),
    isLoading: false,
    error: null,
    currentDistrictId: 'colombo',
    isIOS: false,
    isIOSInstalled: false,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('when open', () => {
    it('renders the modal with title', () => {
      render(<NotificationEnableModal {...defaultProps} />)

      expect(screen.getByText('Enable Prayer Notifications')).toBeInTheDocument()
    })

    it('renders description text', () => {
      render(<NotificationEnableModal {...defaultProps} />)

      expect(screen.getByText("Get notified when it's time to pray")).toBeInTheDocument()
    })

    it('renders district selector', () => {
      render(<NotificationEnableModal {...defaultProps} />)

      expect(screen.getByText('Notification Location')).toBeInTheDocument()
    })

    it('renders enable button', () => {
      render(<NotificationEnableModal {...defaultProps} />)

      expect(screen.getByRole('button', { name: /enable notifications/i })).toBeInTheDocument()
    })

    it('renders cancel button', () => {
      render(<NotificationEnableModal {...defaultProps} />)

      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
    })
  })

  describe('when closed', () => {
    it('does not render modal content', () => {
      render(<NotificationEnableModal {...defaultProps} isOpen={false} />)

      expect(screen.queryByText('Enable Prayer Notifications')).not.toBeInTheDocument()
    })
  })

  describe('interactions', () => {
    it('calls onClose when cancel is clicked', () => {
      render(<NotificationEnableModal {...defaultProps} />)

      fireEvent.click(screen.getByRole('button', { name: /cancel/i }))

      expect(defaultProps.onClose).toHaveBeenCalled()
    })

    it('calls onEnable with selected district when enable is clicked', async () => {
      render(<NotificationEnableModal {...defaultProps} />)

      fireEvent.click(screen.getByRole('button', { name: /enable notifications/i }))

      await waitFor(() => {
        expect(defaultProps.onEnable).toHaveBeenCalledWith('colombo')
      })
    })

    it('calls onClose after successful enable', async () => {
      const onEnable = vi.fn(() => Promise.resolve(true))
      render(<NotificationEnableModal {...defaultProps} onEnable={onEnable} />)

      fireEvent.click(screen.getByRole('button', { name: /enable notifications/i }))

      await waitFor(() => {
        expect(defaultProps.onClose).toHaveBeenCalled()
      })
    })

    it('does not call onClose when enable fails', async () => {
      const onEnable = vi.fn(() => Promise.resolve(false))
      const onClose = vi.fn()
      render(<NotificationEnableModal {...defaultProps} onEnable={onEnable} onClose={onClose} />)

      fireEvent.click(screen.getByRole('button', { name: /enable notifications/i }))

      await waitFor(() => {
        expect(onEnable).toHaveBeenCalled()
      })

      expect(onClose).not.toHaveBeenCalled()
    })
  })

  describe('loading state', () => {
    it('shows loading text when isLoading is true', () => {
      render(<NotificationEnableModal {...defaultProps} isLoading={true} />)

      expect(screen.getByText('Enabling...')).toBeInTheDocument()
    })

    it('disables buttons when loading', () => {
      render(<NotificationEnableModal {...defaultProps} isLoading={true} />)

      expect(screen.getByRole('button', { name: /enabling/i })).toBeDisabled()
      expect(screen.getByRole('button', { name: /cancel/i })).toBeDisabled()
    })
  })

  describe('error state', () => {
    it('displays error message when error is provided', () => {
      render(<NotificationEnableModal {...defaultProps} error="Permission denied" />)

      expect(screen.getByText('Permission denied')).toBeInTheDocument()
    })
  })

  describe('iOS install guide', () => {
    it('shows iOS install instructions when on iOS and not installed', () => {
      render(
        <NotificationEnableModal
          {...defaultProps}
          isIOS={true}
          isIOSInstalled={false}
        />
      )

      expect(screen.getByText('Install Required for Notifications')).toBeInTheDocument()
      // Check for the description text specifically
      expect(screen.getByText('Add to Home Screen for push notifications')).toBeInTheDocument()
    })

    it('shows normal modal when on iOS and installed', () => {
      render(
        <NotificationEnableModal
          {...defaultProps}
          isIOS={true}
          isIOSInstalled={true}
        />
      )

      expect(screen.getByText('Enable Prayer Notifications')).toBeInTheDocument()
      expect(screen.queryByText('Install Required for Notifications')).not.toBeInTheDocument()
    })

    it('shows Got it button on iOS install guide', () => {
      render(
        <NotificationEnableModal
          {...defaultProps}
          isIOS={true}
          isIOSInstalled={false}
        />
      )

      expect(screen.getByRole('button', { name: /got it/i })).toBeInTheDocument()
    })
  })
})
