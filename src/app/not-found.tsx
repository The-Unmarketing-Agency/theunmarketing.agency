import { ButtonLink } from "@/components/ui/ButtonLink";
import { Container } from "@/components/ui/Container";

export default function NotFound() {
  return (
    <section className="not-found section-space">
      <Container>
        <p className="eyebrow">404</p>
        <h1>This page could not be found.</h1>
        <ButtonLink href="/">Return home</ButtonLink>
      </Container>
    </section>
  );
}
