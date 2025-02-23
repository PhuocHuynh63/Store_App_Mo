import { createStackNavigator } from "@react-navigation/stack";
import BottomTabsNavigation from "../bottomTabs";
import DetailScreen from "@screens/Detail";
import { ROUTES } from "@routes/index";

const Stack = createStackNavigator();

const StackNavigation = () => {
    return (
        <Stack.Navigator>
            <Stack.Screen name="MainTabs" component={BottomTabsNavigation} />
            <Stack.Screen name={ROUTES.DETAILS} component={DetailScreen} />
        </Stack.Navigator>
    )
}

export default StackNavigation;