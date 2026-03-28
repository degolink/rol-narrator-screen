import { Title } from './ui/Title';

export function Header({ title, description }) {
  return (
    <header className="mb-10">
      <Title className="text-2xl md:text-4xl mb-4">
        {title}
      </Title>

      {!!description && (
        <p className="text-gray-400 text-sm max-w-2xl">{description}</p>
      )}
    </header>
  );
}
