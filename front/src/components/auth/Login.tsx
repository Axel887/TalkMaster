import * as React from "react";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import AuthLayout from "./Layout";
import Typography from "@mui/material/Typography";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Input from "@mui/material/Input";
import Button from "@mui/material/Button";
import { useLocation } from "react-router-dom";
import { useApiQuery } from "../../hooks/useQuery";
import type { User } from "../../types/User";
import { useState } from "react";

const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

const Login: React.FC = () => {
  const [authMethod, setAuthMethod] = React.useState("speaker");

  const query = useQuery();
  const privateAuth = query.get("private") === "true";

  const [fetch] = useApiQuery<User>("users/login", "POST")

  const [login, setLogin] = useState({
    email: "",
    password: "",
  })

  // const fetch = useApiQuery('user/login', 'POST', {
  //   body: {
  //     email: "",
  //     password: "",
  //   }
  // })

  const handleChange = (
    event: React.MouseEvent<HTMLElement>,
    newAuthMethod: string
  ) => {
    if (newAuthMethod !== null) {
      setAuthMethod(newAuthMethod);
    }
  };
  return (
    <AuthLayout>
      {privateAuth && (
        <div className="flex justify-center mt-10">
          <ToggleButtonGroup
            color="error"
            value={authMethod}
            exclusive
            onChange={handleChange}
            aria-label="Platform"
          >
            <ToggleButton sx={{ width: "200px" }} value="speaker">
              Conférencier
            </ToggleButton>
            <ToggleButton sx={{ width: "200px" }} value="organizer">
              Organisateur
            </ToggleButton>
          </ToggleButtonGroup>
        </div>
      )}
      <div className="login flex justify-center mt-10">
        <div className="flex flex-col items-center w-3/4 max-w-md gap-6">
          <Typography className="text-center">
            {!privateAuth
              ? "Connectez-vous afin de consulter les conférences à venir. "
              : `Connectez-vous en tant que ${authMethod === "organizer" ? "organisateur" : "conférencier"
              } afin d'organiser le programme.`}
          </Typography>
          <div className="flex flex-col gap-2 w-full">
            <form onSubmit={async (e) => {
              e.preventDefault();
              console.log('coucou')
              await fetch({
                body: {
                  email: login.email,
                  password: login.password,
                }
              }).then((res) => {
                console.log(res);
              }).catch((err) => {
                console.error(err);
              })

              console.log("end")
            }}>
              <FormControl variant="standard">
                <InputLabel sx={{ color: "white" }}>Email</InputLabel>
                <Input
                  sx={{ color: "white" }}
                  onChange={({ target: { value } }) => {
                    setLogin((prev) => ({ ...prev, email: value }));
                  }}
                />
              </FormControl>
              <FormControl variant="standard">
                <InputLabel sx={{ color: "white" }}>Mot de passe</InputLabel>
                <Input
                  sx={{ color: "white" }}
                  onChange={({ target: { value } }) => {
                    setLogin((prev) => ({ ...prev, password: value }));
                  }}
                  type="password"
                />
              </FormControl>
              <Button className="w-full" size="large" variant="contained" type="submit">
                Valider
              </Button>
            </form>
          </div>
          <Typography className="text-center">
            Pas de compte ?<a href="/"> Inscrivez-vous !</a>
          </Typography>
        </div>
      </div>
    </AuthLayout>
  );
};

export default Login;
