type PagePlaceholderProps = {
  title: string;
  description: string;
};

export default function PagePlaceholder({
  title,
  description,
}: PagePlaceholderProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
      <p className="text-sm font-medium text-blue-600">AI Study Assistant</p>
      <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
        {title}
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 md:text-base">
        {description}
      </p>
    </section>
  );
}
