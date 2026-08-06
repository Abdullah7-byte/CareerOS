type LogoProps = {
  name: string;
};

export default function Logo({ name }: LogoProps) {
  return <h1>{name}</h1>;
}