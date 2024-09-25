import Loading from './loading'
import LoadingGlobal from './loading-global'

const LoadingPage = () => {
    return (
        <div className="h-full w-full flex justify-center items-center">
            <LoadingGlobal></LoadingGlobal>
            {/* <Loading></Loading> */}
        </div>
    )
}

export default LoadingPage