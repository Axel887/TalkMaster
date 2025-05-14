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

const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

const Login: React.FC = () => {
  const [authMethod, setAuthMethod] = React.useState("speaker");

  const query = useQuery();
  const privateAuth = query.get("private") === "true";

  const handleChange = (
    _: React.MouseEvent<HTMLElement>,
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
              : `Connectez-vous en tant que ${
                  authMethod === "organizer" ? "organisateur" : "conférencier"
                } afin d'organiser le programme.`}
          </Typography>
          <div className="flex flex-col gap-2 w-full">
            <FormControl variant="standard">
              <InputLabel sx={{ color: "white" }}>Email</InputLabel>
              <Input sx={{ color: "white" }} />
            </FormControl>
            <FormControl variant="standard">
              <InputLabel sx={{ color: "white" }}>Mot de passe</InputLabel>
              <Input sx={{ color: "white" }} />
            </FormControl>
          </div>
          <Button className="w-full" size="large" variant="contained">
            Valider
          </Button>
          <Typography className="text-center">
            Pas de compte ?<a href="/"> Inscrivez-vous !</a>
          </Typography>
        </div>
      </div>
    </AuthLayout>
  );
};

export default Login;
