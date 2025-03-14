import Footer from "./Footer"
import Location from "./Location"
import "./RegisterEvent.css"
// import 
const titleImage = "https://qpedcspyudeptjfwuwhl.supabase.co/storage/v1/object/public/event_images//cca9bbab00fa1a880a11fefa99616458.jpg"
const title = "HOT DOG CONTEST"


function RegisterEvent() {
    return(
        <>
            <main>
                <Location />
                <div>
                    <div className="title-card">
                        <img className="title-image" src={titleImage} />
                        <p className="title"></p>
                    </div>
                    <p className="description"></p>
                    <div className="date"></div>
                    <div className="time"></div>
                    <div className="location"></div>
                    <div className="rew-pts"></div>
                </div>
            </main>
            <Footer />
        </>
    )
}

export default RegisterEvent