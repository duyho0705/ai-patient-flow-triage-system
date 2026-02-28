import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt'
import { X, Loader2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

export default function VideoCall({
    roomID,
    userID,
    userName,
    onClose
}: {
    roomID: string,
    userID: string,
    userName: string,
    onClose: () => void
}) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isJoining, setIsJoining] = useState(true);

    useEffect(() => {
        if (!containerRef.current) return;

        const appID = 1068122249;
        const serverSecret = "f8e77a0de6c577b26593190b12fd90b7";

        // Generate Token
        const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
            appID,
            serverSecret,
            roomID,
            userID,
            userName
        );

        // Create instance object from kit token.
        const zp = ZegoUIKitPrebuilt.create(kitToken);

        // start the call
        zp.joinRoom({
            container: containerRef.current,
            scenario: {
                mode: ZegoUIKitPrebuilt.OneONoneCall,
            },
            showScreenSharingButton: true,
            turnOnMicrophoneWhenJoining: true,
            turnOnCameraWhenJoining: true,
            showPreJoinView: false,
            onLeaveRoom: () => {
                onClose();
            },
            onJoinRoom: () => {
                setIsJoining(false);
            }
        });

        // Cleanup
        return () => {
            zp.destroy();
        };
    }, [roomID, userID, userName, onClose]);

    return (
        <div className="fixed inset-0 z-[100] bg-slate-900 flex flex-col justify-center items-center">
            {isJoining && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 z-10">
                    <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mb-4" />
                    <p className="text-emerald-400 font-bold tracking-widest uppercase">Đang kết nối Video Call...</p>
                </div>
            )}

            <button
                onClick={onClose}
                className="absolute top-6 right-6 z-[60] bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white p-3 rounded-full transition-all shadow-lg"
            >
                <X className="w-6 h-6" />
            </button>

            <div
                className="w-full h-full p-4 md:p-12"
                ref={containerRef}
            />
        </div>
    )
}
