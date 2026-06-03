"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { authApi, getErrorMessage } from "@/lib/api"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/Button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/Input"

const reservedUsernames = [
  'admin',
  'administrator',
  'root',
  'superadmin',
  'system',
]

function validateUsername(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return 'Username wajib diisi.'
  if (trimmed.length < 4) return 'Username minimal 4 karakter.'
  if (!/^[a-zA-Z0-9._-]+$/.test(trimmed)) return 'Username hanya boleh huruf, angka, titik, garis bawah, atau strip.'
  if (reservedUsernames.includes(trimmed.toLowerCase())) return 'Username ini tidak tersedia. Silakan pilih username lain.'
  return ''
}

function validatePassword(value: string) {
  if (!value) return 'Password wajib diisi.'
  if (value.length < 6) return 'Password minimal 6 karakter.'
  return ''
}

function validateCustomerNumber(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return 'NIK wajib diisi.'
  if (!/^[0-9]{16}$/.test(trimmed)) return 'NIK harus 16 digit angka tanpa spasi.'
  return ''
}

function validateName(value: string) {
  if (!value.trim()) return 'Nama lengkap wajib diisi.'
  if (value.trim().length < 3) return 'Nama lengkap minimal 3 karakter.'
  return ''
}

function validatePhone(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return 'Nomor telepon wajib diisi.'
  if (!/^[0-9]{9,15}$/.test(trimmed)) return 'Nomor telepon harus berupa angka 9-15 digit.'
  return ''
}

function validateAddress(value: string) {
  if (!value.trim()) return 'Alamat wajib diisi.'
  if (value.trim().length < 5) return 'Alamat terlalu pendek.'
  return ''
}

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter()

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [customerNumber, setCustomerNumber] = useState("")
  const [address, setAddress] = useState("")
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({
    username: '',
    password: '',
    customerNumber: '',
    address: '',
    name: '',
    phone: '',
  })

  const validateForm = () => {
    const usernameError = validateUsername(username)
    const passwordError = validatePassword(password)
    const customerNumberError = validateCustomerNumber(customerNumber)
    const addressError = validateAddress(address)
    const nameError = validateName(name)
    const phoneError = validatePhone(phone)

    setErrors({
      username: usernameError,
      password: passwordError,
      customerNumber: customerNumberError,
      address: addressError,
      name: nameError,
      phone: phoneError,
    })

    return !(
      usernameError ||
      passwordError ||
      customerNumberError ||
      addressError ||
      nameError ||
      phoneError
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    if (!validateForm()) {
      toast.error('Perbaiki data pendaftaran sebelum melanjutkan.')
      setLoading(false)
      return
    }

    try {
      await authApi.register({
        username: username.trim(),
        password,
        customer_number: customerNumber.trim(),
        address: address.trim(),
        name: name.trim(),
        phone: phone.trim(),
      })
      toast.success("Registrasi berhasil! Silakan login.")
      router.push("/login")
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={handleSubmit}>
        <FieldGroup>
          <div className="flex flex-col items-center gap-2 text-center">
            <Link
              href="/"
              className="flex flex-col items-center gap-2 font-bold text-2xl text-primary-600"
            >
              <span>TripiTropa</span>
            </Link>
            <h1 className="text-xl font-bold">Daftar Akun Baru</h1>
            <FieldDescription>
              Sudah punya akun?{" "}
              <Link href="/login" className="text-primary-600 hover:underline">
                Masuk
              </Link>
            </FieldDescription>
          </div>
          <Field>
            <FieldLabel htmlFor="username">Username</FieldLabel>
            <Input
              id="username"
              type="text"
              placeholder="Username Anda"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={loading}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="name">Nama Lengkap</FieldLabel>
            <Input
              id="name"
              type="text"
              placeholder="Nama Lengkap Anda"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="customer_number">NIK (Nomor Induk Kependudukan)</FieldLabel>
            <Input
              id="customer_number"
              type="text"
              placeholder="NIK 16 digit"
              value={customerNumber}
              onChange={(e) => setCustomerNumber(e.target.value)}
              required
              disabled={loading}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="phone">Nomor Telepon</FieldLabel>
            <Input
              id="phone"
              type="tel"
              placeholder="Contoh: 08123456789"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              disabled={loading}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="address">Alamat</FieldLabel>
            <Input
              id="address"
              type="text"
              placeholder="Alamat Lengkap Anda"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
              disabled={loading}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Input
              id="password"
              type="password"
              placeholder="Minimal 6 karakter"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              disabled={loading}
            />
          </Field>
          <Field>
            <Button type="submit" className="w-full" isLoading={loading} disabled={loading}>
              Daftar
            </Button>
          </Field>
        </FieldGroup>
      </form>
      <FieldDescription className="px-6 text-center">
        Dengan mendaftar, Anda menyetujui <a href="#">Ketentuan Layanan</a> dan{" "}
        <a href="#">Kebijakan Privasi</a> kami.
      </FieldDescription>
    </div>
  )
}
