import { style } from './style';

export type ErrorWrapperProps = {
  children?: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
};

export const ErrorWrapper: React.FC<ErrorWrapperProps> = (props) => {
  return (
    <div css={style.errorWrapper} onClick={props.onClick}>
      {props.children}
    </div>
  );
};
