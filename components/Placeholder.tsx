interface PlaceholderProps {
  title: string;
  owner: string;
  doc: string;
  todo: string[];
}

/**
 * 未実装画面のプレースホルダー。
 * 各担当エンジニアが page.tsx を置き換えたら不要になる。
 */
export default function Placeholder({ title, owner, doc, todo }: PlaceholderProps) {
  return (
    <main className="px-4 py-6">
      <span className="inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
        未実装 ・ 担当: {owner}
      </span>
      <h1 className="mt-3 text-xl font-bold text-slate-800">{title}</h1>
      <p className="mt-1 text-sm text-slate-500">
        指示書: <code className="rounded bg-slate-100 px-1">{doc}</code>
      </p>
      <ul className="mt-4 space-y-2">
        {todo.map((t) => (
          <li
            key={t}
            className="flex items-start gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700"
          >
            <span className="text-brand">☐</span>
            {t}
          </li>
        ))}
      </ul>
    </main>
  );
}
