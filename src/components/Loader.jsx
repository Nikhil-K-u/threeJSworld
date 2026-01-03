import { Html } from '@react-three/drei'

export default function Loader() {
  return (
    <Html center>
      <div className="loading">
        <div>
          <div style={{ textAlign: 'center' }}>Loading</div>
          <div className="loading-bar">
            <div className="loading-bar-inner" style={{ width: '100%' }} />
          </div>
        </div>
      </div>
    </Html>
  )
}
