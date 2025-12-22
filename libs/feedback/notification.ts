import { showMessage } from "react-native-flash-message";

export const successNotification = (message: string) => {
  showMessage({
    message: message,
    type: "success",
    duration: 3000,
    icon: "auto",
    floating: true,
  });
};

export const errorNotification = (message: string) => {
  showMessage({
    message: message,
    type: "danger",
    duration: 4000,
    icon: "auto",
    floating: true,
  });
};

export const infoNotification = (message: string) => {
  showMessage({
    message: message,
    type: "info",
    duration: 3000,
    icon: "auto",
    floating: true,
  });
};

export const warningNotification = (message: string) => {
  showMessage({
    message: message,
    type: "warning",
    duration: 3000,
    icon: "auto",
    floating: true,
  });
};