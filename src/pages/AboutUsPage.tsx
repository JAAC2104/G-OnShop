import Footer from "../components/Footer";

export default function AboutUsPage() {
  return (
    <>
      <div className="min-h-screen">
        <div className="hidden lg:block">
          <div className="relative max-w-5xl mx-auto my-12 h-[720px]">
            <div className="animate-slide-up [--delay:200ms] absolute left-0 top-6 z-[90]">
              <img
                src="https://picsum.photos/400/600?37"
                alt="Imagen"
                className="rounded-lg shadow-md w-[400px] h-[600px] object-cover"
              />
            </div>

            <div className="animate-slide-up [--delay:1000ms] absolute right-10 top-10 z-[80]">
              <div className="rounded-lg p-10 bg-pink shadow-md w-[720px] max-w-[72vw]">
                <h1 className="text-end text-5xl text-white leading-none">Sobre Nosotros</h1>
              </div>
            </div>

            <div className="animate-slide-up [--delay:1200ms] absolute right-28 top-[150px] z-[70]">
              <div className="bg-neutral-300/50 backdrop-blur rounded-lg p-10 shadow-md w-[520px] max-w-[52vw] text-blue text-justify leading-relaxed">
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Possimus sed aliquid
                asperiores est accusantium, molestiae ipsam quasi odit quod dolorum veritatis
                architecto dolor earum. Quae dolorum distinctio necessitatibus perspiciatis
                nobis. Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptatibus est
                neque ullam, ad in dignissimos illum laboriosam aliquid quos. Possimus id quidem
                alias saepe adipisci repellat quos dolores libero commodi maxime nemo placeat amet
                doloremque, eum expedita totam voluptatibus incidunt, dolorum molestias unde
                corrupti sint obcaecati. Itaque ea molestias ipsum voluptas saepe beatae quaerat?
                Suscipit eveniet quibusdam ratione porro ipsa repellat veritatis excepturi quasi
                voluptatibus provident doloribus minus similique, nulla officiis commodi facere.
                Suscipit eum soluta iusto animi adipisci sit expedita asperiores quibusdam. Earum
                officia placeat vitae ut eaque consectetur, officiis harum delectus mollitia optio
                dolore repudiandae laborum doloremque
              </div>
            </div>
          </div>
        </div>

        <div className="block lg:hidden">
          <div className="animate-slide-up [--delay:200ms] bg-pink m-5 flex p-5 justify-center items-center rounded-lg shadow-md">
            <h1 className="text-3xl text-white">Sobre Nosotros</h1>
          </div>

          <div className="animate-slide-up [--delay:1000ms] m-5">
            <img
              src="https://picsum.photos/900/200?37"
              alt="Imagen"
              className="shadow-md w-full h-[220px] sm:h-[260px] object-cover rounded-md"
            />
          </div>

          <div className="animate-slide-up [--delay:1200ms] bg-neutral-300/50 backdrop-blur rounded-lg p-5 m-5 text-blue text-justify leading-relaxed">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Possimus sed aliquid asperiores
            est accusantium, molestiae ipsam quasi odit quod dolorum veritatis architecto dolor earum.
            Quae dolorum distinctio necessitatibus perspiciatis nobis. Lorem ipsum dolor sit amet
            consectetur adipisicing elit. Voluptatibus est neque ullam, ad in dignissimos illum
            laboriosam aliquid quos. Possimus id quidem alias saepe adipisci repellat quos dolores
            libero commodi maxime nemo placeat amet doloremque, eum expedita totam voluptatibus
            incidunt, dolorum molestias unde corrupti sint obcaecati. Itaque ea molestias ipsum
            voluptas saepe beatae quaerat? Suscipit eveniet quibusdam ratione porro ipsa repellat
            veritatis excepturi quasi voluptatibus provident doloribus minus similique, nulla officiis
            commodi facere. Suscipit eum soluta iusto animi adipisci sit expedita asperiores
            quibusdam. Earum officia placeat vitae ut eaque consectetur, officiis harum delectus
            mollitia optio dolore repudiandae laborum doloremque
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
