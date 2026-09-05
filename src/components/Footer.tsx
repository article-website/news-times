import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-gray-300 mt-16">
      <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <p className="text-white text-lg font-bold mb-3">
            News<span className="text-blue-500">Hub</span>
          </p>
          <p className="text-sm text-gray-400">
            Sumber informasi terpercaya untuk berita terbaru dari dalam dan luar
            negeri.
          </p>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-3">Navigasi</h4>
          <ul className="flex flex-col gap-2 text-sm">
            <li>
              <a href="/" className="hover:text-white">
                Beranda
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-white">
                Tentang Kami
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-white">
                Kategori
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-white">
                Kontak
              </a>
            </li>
            <li>
              <a href="/admin" className="hover:text-white text-gray-400">
                Redaksi (Admin)
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-3">Kategori</h4>
          <ul className="flex flex-col gap-2 text-sm">
            <li>
              <a href="#" className="hover:text-white">
                Nasional
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-white">
                Internasional
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-white">
                Ekonomi
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-white">
                Teknologi
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-3">Kontak</h4>
          <p className="text-sm text-gray-400">info@newshub.id</p>
          <p className="text-sm text-gray-400 mt-2">
            Jl. Merdeka No. 123, Jakarta, Indonesia
          </p>
        </div>
      </div>

      <div className="border-t border-slate-800 text-center text-xs text-gray-500 py-4">
        © {new Date().getFullYear()} NewsHub. Semua Hak Dilindungi.
      </div>
    </footer>
  );
}