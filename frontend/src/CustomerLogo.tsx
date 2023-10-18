/**
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Box, Typography } from "@mui/material";
import config from "../../config.json";

export const CustomerLogo = () => {
  const Logo = () => {
    switch (config.customer) {
      case "altostrat":
        return (
          <Typography
            sx={{
              fontWeight: "bold",
              fontSize: 24,
              color: "white",
              display: {
                xs: "none",
                sm: "block",
              },
              width: 195,
              heigth: 35,
            }}
          >
            🏢ALTOSTRAT
          </Typography>
        );
      default:
        return <></>;
    }
  };
  return (
    <Box sx={{ position: "relative" }}>
      <Logo />
      <Typography
        sx={{
          position: "absolute",
          bottom: -8,
          right: -8,
          color: "red",
          fontWeight: "bold",
          fontSize: 20,
        }}
      >
        DEMO
      </Typography>
    </Box>
  );
};
