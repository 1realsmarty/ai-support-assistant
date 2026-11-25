import type { Business } from '../types';

interface Props {
  business: Business;
  setBusiness: (b: Business) => void;
}

export default function KnowledgeView({ business, setBusiness }: Props) {
  const set = (key: keyof Business) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setBusiness({ ...business, [key]: e.target.value });

  return (
    <section className="page">
      <h1>Your business</h1>
      <p className="hint">
        The assistant answers only from what you write here. Anything missing will be flagged for
        you instead of guessed. Changes save automatically.
      </p>

      <label className="field">
        <span>Business name</span>
        <input value={business.name} onChange={set('name')} placeholder="e.g. Ada's Fabrics" />
      </label>

      <label className="field">
        <span>What the business does</span>
        <textarea
          rows={4}
          value={business.about}
          onChange={set('about')}
          placeholder="What you sell, who it's for, where you operate, opening hours."
        />
      </label>

      <label className="field">
        <span>Products and prices</span>
        <textarea
          rows={8}
          value={business.products}
          onChange={set('products')}
          placeholder={'One per line, e.g.\nAnkara fabric, 6 yards: ₦18,000 (in stock)'}
        />
      </label>

      <label className="field">
        <span>Delivery, payment and policies</span>
        <textarea
          rows={6}
          value={business.policies}
          onChange={set('policies')}
          placeholder="Delivery areas and time, payment methods, returns, how to contact you."
        />
      </label>
    </section>
  );
}
