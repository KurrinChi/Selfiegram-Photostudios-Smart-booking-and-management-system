import AuthLayout from "../components/AuthLayout";
import RegisterForm from "../components/RegisterForm";

const Register = () => {
  return (
    <AuthLayout
      reverse={false}
      images={[
        {
          src: "../storage/packages/barkadagroupie/barkada3.jpg",
          label: "Create",
          className:
            "absolute bottom-[47%] left-[0%] rotate-[-15deg] z-10 w-[50%]",
        },
        {
          src: "../storage/packages/kiddie/kiddie5.jpg",
          label: "Your",
          className:
            "absolute top-[20%] left-[50%] rotate-[-5deg] z-20 w-[50%]",
        },
        {
          src: "../public/storage/packages/prenup/prenup2.jpg",
          label: "Story",
          className: "absolute top-[48%] left-[0%] rotate-[15deg] z-30 w-[50%]",
        },
      ]}
    >
      <RegisterForm />
    </AuthLayout>
  );
};

export default Register;
