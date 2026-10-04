import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Pressable, SafeAreaView, Text, View } from 'react-native';
import { getProducts, Product } from './src/api';

const gold = '#F5B942';
const ink = '#0B0F14';

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProducts().then((data) => setProducts(data.items)).catch(() => setProducts([])).finally(() => setLoading(false));
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      <StatusBar style="dark" />
      <View style={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 14, backgroundColor: ink }}>
        <Text style={{ color: gold, fontSize: 12, letterSpacing: 3, fontWeight: '800' }}>CHACHA PRIME</Text>
        <Text style={{ color: '#F8FAFC', fontSize: 30, fontWeight: '900', marginTop: 8 }}>Better choices.</Text>
        <Text style={{ color: '#F8FAFC', fontSize: 30, fontWeight: '900' }}>Brighter life.</Text>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator size="large" color={gold} /></View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ padding: 20, gap: 16 }}
          ListHeaderComponent={<Text style={{ fontSize: 22, fontWeight: '900', color: ink, marginBottom: 2 }}>Prime picks</Text>}
          renderItem={({ item }) => (
            <Pressable style={{ backgroundColor: '#fff', borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: '#E7E9ED' }}>
              <View style={{ height: 210, backgroundColor: '#EEF1F4', justifyContent: 'center', alignItems: 'center' }}>
                {item.images?.[0] ? <Image source={{ uri: item.images[0] }} style={{ width: '100%', height: '100%' }} resizeMode="cover" /> : <Text style={{ color: '#A27A1C', fontWeight: '900', letterSpacing: 3 }}>PRIME</Text>}
              </View>
              <View style={{ padding: 16 }}>
                <Text style={{ color: ink, fontWeight: '800', fontSize: 16 }}>{item.name}</Text>
                <Text style={{ color: '#927019', fontWeight: '900', fontSize: 19, marginTop: 8 }}>£{item.price.toFixed(2)}</Text>
              </View>
            </Pressable>
          )}
          ListEmptyComponent={<Text style={{ color: '#6B7280', paddingVertical: 30 }}>No products available yet.</Text>}
        />
      )}
    </SafeAreaView>
  );
}
