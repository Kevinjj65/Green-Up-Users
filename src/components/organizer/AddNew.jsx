import Footer from './Footer'
import './Organizer.css'

function AddNew() {
    return(
        <>
            <div className='container'>
                <main>
                    <h1>Be an Organizer Now</h1>
                    <input className='input name' type='text' placeholder='Name of the Event' />
                    <input className='input date' type='date' placeholder='Date' />
                    <div className='time'>
                        <input className='input start' type='time' placeholder='Time' />
                        <input className='input end' type='time' placeholder='Time' />
                    </div>
                    <input className='input loc' type='text' placeholder='Location' />
                    <input className='input nop' type='number' placeholder='Max No. of Participants' />
                    <input className='input rewpts' type='number' placeholder='Alloted Reward Points' />
                    <div className='check'>
                        <input className='checkbox' type='checkbox' /><span className='check-text'>I agree to Terms & Conditions</span>
                    </div>
                    <button className='btn1 regbtn'>Register Now</button>
                </main>
                <Footer />
            </div>
        </>
    )
}

export default AddNew