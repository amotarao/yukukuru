export const LoadingCircle: React.FC = () => {
  return (
    <div className="mx-auto my-[60px] h-[5rem] w-[5rem] animate-spin rounded-full border-[3px] border-back-shadow border-l-sub indent-[-9999em] after:h-[5rem] after:w-[5rem] after:rounded-full">
      読み込み中
    </div>
  );
};
