import { ButtonComponent } from "@syncfusion/ej2-react-buttons";
import { Link, useLocation } from "react-router";
import { cn } from "~/lib/utils";

interface Props {
  title: string;
  description: string;
  ctaText?: string;
  ctaUrl?: string;
  ctaIcon?: string;
}

const Header = ({ title, description, ctaText, ctaUrl, ctaIcon }: Props) => {
  const location = useLocation();
  return (
    <header className="header">
      <article>
        <h1 className={cn("text-dark-100", "text-2xl md:text-4xl font-bold")}>
          {title}
        </h1>
        <p className={cn("text-grey-100 font-normal", "text-base md:text-lg ")}>
          {description}
        </p>
      </article>

      {ctaText && ctaUrl && (
        <Link to={ctaUrl}>
          <ButtonComponent
            type="button"
            className="button-class h-11! w-full! md:w-60"
          >
            <img
              src={`/assets/icons/${ctaIcon ? ctaIcon : "plus"}.svg`}
              alt="plus"
              className="size-5 "
            />
            <span className="p-16-semibold text-white">{ctaText}</span>
          </ButtonComponent>
        </Link>
      )}
    </header>
  );
};

export default Header;
