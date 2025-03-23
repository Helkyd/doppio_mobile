import React, { useContext } from "react";
import { AuthContext } from "../provider/auth";

import { Layout, Button } from "@ui-kitten/components";

import * as Linking from "expo-linking";


const LoginScreen = () => {
  const { isAuthenticated, promptAsync, request } = useContext(AuthContext);

  console.log('LINNNKKK URL');
  console.log(Linking.createURL() + '/--/');
  console.log(process.env);

  return (
    <Layout
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 20,
        rowGap: 20,
      }}
    >
      {!isAuthenticated && (
        <Button
          disabled={!request}
          onPress={() => {
            promptAsync();
          }}
        >
          Login with Frappe
        </Button>
      )}
    </Layout>
  );
};

export default LoginScreen;
