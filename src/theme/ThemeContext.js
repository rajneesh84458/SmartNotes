import  AsyncStorage  from '@react-native-async-storage/async-storage';
import {createContext, useContext, useEffect, useState} from 'react';
import { darkTheme, lightTheme } from './colors';

const ThemeContext = createContext();

export const ThemeProvider = ({children})=>{
 const [isDark,setIsDark] = useState(false)

 useEffect(()=>{
  loadTheme();
 },[])

 const loadTheme = async()=>{
 
  const savedTheme = await AsyncStorage.getItem("theme");
  if (savedTheme !== null) {
    setIsDark(savedTheme === 'dark');
  }
 }

 const toggleTheme = async()=>{
  const newTheme = !isDark;
  setIsDark(newTheme);
  await AsyncStorage.setItem("theme", newTheme ? 'dark' : 'light');
 }

 const theme = isDark ? darkTheme : lightTheme;

 return (
  <ThemeContext.Provider value={{theme, isDark,toggleTheme}}>
   {children}
  </ThemeContext.Provider>
 )

}


export const useTheme = () => useContext(ThemeContext);
