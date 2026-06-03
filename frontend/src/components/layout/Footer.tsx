import Link from 'next/link';
import { Plane } from 'lucide-react';

export function Footer() {
  return (
    <footer className="mt-20 border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-8 xl:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600 text-white">
                <Plane className="h-5 w-5" />
              </span>
              <span className="text-xl font-bold text-primary-700">TripiTropa</span>
            </Link>
            <p className="text-base text-slate-500">
              Pemesanan tiket pesawat, bus, dan kapal yang cepat, aman, dan nyaman.
              Mitra perjalanan terpercaya Anda.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-900">
                  Perusahaan
                </h3>
                <ul role="list" className="mt-4 space-y-4">
                  <li>
                    <Link href="#" className="text-base text-slate-500 hover:text-slate-900">
                      Tentang Kami
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-base text-slate-500 hover:text-slate-900">
                      Karir
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-base text-slate-500 hover:text-slate-900">
                      Blog
                    </Link>
                  </li>
                </ul>
              </div>
              <div className="mt-12 md:mt-0">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-900">
                  Dukungan
                </h3>
                <ul role="list" className="mt-4 space-y-4">
                  <li>
                    <Link href="#" className="text-base text-slate-500 hover:text-slate-900">
                      Pusat Bantuan
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-base text-slate-500 hover:text-slate-900">
                      Hubungi Kami
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-base text-slate-500 hover:text-slate-900">
                      FAQ
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-900">
                  Layanan
                </h3>
                <ul role="list" className="mt-4 space-y-4">
                  <li>
                    <Link href="#" className="text-base text-slate-500 hover:text-slate-900">
                      Tiket Pesawat
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-base text-slate-500 hover:text-slate-900">
                      Tiket Bus
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-base text-slate-500 hover:text-slate-900">
                      Tiket Kapal
                    </Link>
                  </li>
                </ul>
              </div>
              <div className="mt-12 md:mt-0">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-900">
                  Legal
                </h3>
                <ul role="list" className="mt-4 space-y-4">
                  <li>
                    <Link href="#" className="text-base text-slate-500 hover:text-slate-900">
                      Kebijakan Privasi
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-base text-slate-500 hover:text-slate-900">
                      Syarat Ketentuan
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-12 border-t border-slate-200 pt-8">
          <p className="text-base text-slate-400 xl:text-center">
            &copy; {new Date().getFullYear()} TripiTropa Inc. Seluruh hak cipta dilindungi.
          </p>
        </div>
      </div>
    </footer>
  );
}
