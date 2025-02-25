import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { ROUTES } from "@routes/index";
import FavoriteScreen from "@screens/Favorite";
import HomeScreen from "@screens/Home";
import Entypo from '@expo/vector-icons/Entypo';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import getTabBarIcon from "@atoms/Icon";
import { colors } from "@themes/colors";

const BottomTab = createBottomTabNavigator();

const BottomTabsNavigation = () => {
    return (
        <BottomTab.Navigator screenOptions={{
            headerShown: false,
            tabBarStyle: { backgroundColor: colors.white.bg, borderTopWidth: 0, height: 60 },
            tabBarActiveTintColor: colors.red.bg,
            tabBarInactiveTintColor: "#999"
        }}>
            <BottomTab.Screen
                name={ROUTES.HOME}
                component={HomeScreen}
                options={{
                    tabBarIcon: getTabBarIcon(Entypo, 'home'),
                }}
            />
            <BottomTab.Screen
                name={ROUTES.FAVORITES}
                component={FavoriteScreen}
                options={{
                    tabBarIcon: getTabBarIcon(MaterialIcons, 'favorite'),
                }}
            />
        </BottomTab.Navigator>
    );
}

export default BottomTabsNavigation;