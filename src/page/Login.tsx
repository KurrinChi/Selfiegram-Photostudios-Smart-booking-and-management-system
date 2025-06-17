import AuthLayout from "../components/AuthLayout";
import LoginForm from "../components/LoginForm";

const Login = () => (
  <AuthLayout
    reverse={true}
    images={[
      {
        src: "../public/slfg-placeholder.png",
        label: "Seize",
        className:
          "absolute bottom-[50%] left-[0%] rotate-[-10deg] z-10 w-[50%]",
      },
      {
        src: "../public/slfg-placeholder.png",
        label: "Great",
        className:
          "absolute top-[20%] left-[50%] rotate-[5deg] z-20 w-[50%]",
      },
      {
        src: "../public/slfg-placeholder.png",
        label: "Moment",
        className:
          "absolute top-[48%] left-[0%] rotate-[10deg] z-30 w-[50%]",
      },
    ]}
  >
    <LoginForm />
  </AuthLayout>
);

export default Login;
