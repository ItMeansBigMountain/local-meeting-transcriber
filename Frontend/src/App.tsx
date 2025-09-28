import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Login from "./screens/Login";
import Record from "./screens/Record";
import Meetings from "./screens/Meetings";
import MeetingDetail from "./screens/MeetingDetail";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Record" component={Record} />
        <Stack.Screen name="Meetings" component={Meetings} />
        <Stack.Screen name="MeetingDetail" component={MeetingDetail} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
