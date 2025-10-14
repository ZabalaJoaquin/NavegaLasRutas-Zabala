import Hero from '../components/Hero.jsx'
import ProductList from '../components/ProductList.jsx'
import Brands from '../components/Brands.jsx'
import InstagramStrip from '../components/InstagramStrip.jsx'

export default function Home(){
  return (
    <div>
      <Hero />
      <section className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-4">Destacados</h2>
        <ProductList />
      </section>
      <Brands />
      <InstagramStrip />
    </div>
  )
}
