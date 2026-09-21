import Link from "next/link";

const categories = [
  "Nasional",
  "Internasional",
  "Ekonomi",
  "Teknologi",
  "Olahraga",
  "Lifestyle",
];

export default function CategoryList() {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <h3 className="font-semibold text-gray-900 mb-4">Kategori</h3>
      <ul className="flex flex-col">
        {categories.map((category) => (
          <li key={category}>
            <Link
              href={`/categories/${category.toLowerCase()}`}
              className="flex items-center justify-between py-2 text-sm text-gray-700 hover:text-blue-600 transition-colors"
            >
              {category}
              <span>›</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
