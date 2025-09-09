type PricingCardProps = {
  name: string;
  price: string;
  features: string[];
  onSelect: () => void;
  popular?: boolean;
};

export function PricingCard({ name, price, features, onSelect, popular }: PricingCardProps) {
  return (
    <div className={`border-2 ${popular ? 'border-blue-500' : 'border-gray-200'} rounded-lg p-5 grid gap-3 relative ${popular ? 'bg-blue-50' : 'bg-white'}`}>
      {popular && (
        <div className="absolute top-[-10px] right-4 bg-blue-500 text-white px-4 py-1 rounded-full text-xs font-semibold">
          Популярный
        </div>
      )}
      <div className="text-2xl font-semibold">{name}</div>
      <div className="text-3xl font-bold">{price}</div>
      <ul className="m-0 pl-6">
        {features.map((f, i) => (
          <li key={i} className="mb-3">{f}</li>
        ))}
      </ul>
      <button onClick={onSelect} className="primary-button">
        Начать зарабатывать
      </button>
      <div className="text-sm text-gray-600">Окупаемость с 1–2 сделок</div>
    </div>
  );
}
