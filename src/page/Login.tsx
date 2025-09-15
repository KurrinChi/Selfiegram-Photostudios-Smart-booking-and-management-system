import AuthLayout from "../components/AuthLayout";
import LoginForm from "../components/LoginForm";

const Login = () => (
  <AuthLayout
    reverse={true}
    images={[
      {
        src: "../storage/packages/family/fam1.jpg",
        label: "Seize",
        className:
          "absolute bottom-[47%] left-[10%] rotate-[-10deg] z-10 w-[30%]",
      },
      {
        src: "../storage/packages/selfieforone/sone2.png",
        label: "Great",
        className: "absolute top-[20%] left-[60%] rotate-[5deg] z-30 w-[50%]",
      },
      {
        src: "../storage/packages/selfiefortwo/stwo5.png",
        label: "Moment",
        className: "absolute top-[48%] left-[13%] rotate-[10deg] z-20 w-[50%]",
      },
    ]}
  >
    <LoginForm />
  </AuthLayout>
);

export default Login;
