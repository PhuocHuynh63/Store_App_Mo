import 'react-native-gesture-handler';
import "./global.css"
import { NavigationContainer } from '@react-navigation/native';
import DrawerNavigation from 'src/navigates/drawers';

export default function App() {
  return (
    <NavigationContainer>
      <DrawerNavigation />
    </NavigationContainer>
  );
}
