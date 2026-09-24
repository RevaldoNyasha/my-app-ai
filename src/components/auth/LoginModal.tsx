import { useAuth } from '@/auth/AuthContext'
import { LoginForm } from '@/components/auth/LoginForm'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'

export function LoginModal() {
  const { loginOpen, closeLogin } = useAuth()

  return (
    <Modal
      open={loginOpen}
      onClose={closeLogin}
      title="Log in to continue"
      description="Sign in to keep asking questions and uploading research data."
      footer={
        <Button variant="ghost" onClick={closeLogin}>
          Maybe later
        </Button>
      }
    >
      <LoginForm onSuccess={closeLogin} />
    </Modal>
  )
}