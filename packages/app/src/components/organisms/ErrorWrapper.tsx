export type ErrorWrapperProps = {
  children?: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
};

export const ErrorWrapper: React.FC<ErrorWrapperProps> = (props) => {
  return (
    <div
      className="m-[0.5rem_1rem_1rem] flex flex-wrap justify-center border border-shadow p-[0.5rem_1rem] text-[0.8em] text-danger"
      onClick={props.onClick}
    >
      {props.children}
    </div>
  );
};
