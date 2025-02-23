import "./global.css"
import { NavigationContainer } from '@react-navigation/native';
import StackNavigation from 'src/navigates/stack';

export default function App() {
  return (
    <NavigationContainer>
      <StackNavigation />
    </NavigationContainer>
  );
}
