type Props = {
  message: string;
};

export function EmptyState({ message }: Props) {
  return (
    <div className="emptyState">
      <p>{message}</p>
    </div>
  );
}
