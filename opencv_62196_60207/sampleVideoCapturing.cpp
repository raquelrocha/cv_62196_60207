/**
 * Change Detection project.
 * Catarina Bastos 60207
 * Raquel Rocha 62196
 * Computação Visual 2016/2017
 * Universidade de Aveiro
 */

//opencv
#include "opencv2/imgcodecs.hpp"
#include "opencv2/imgproc.hpp"
#include "opencv2/videoio.hpp"
#include <opencv2/highgui.hpp>
#include <opencv2/tracking.hpp>
#include <opencv2/video.hpp>
#include "opencv2/objdetect.hpp"

//C
#include <stdio.h>
//C++
#include <iostream>
#include <sstream>

using namespace cv;
using namespace std;

// Global variables
Mat frame; //current/captured frame
char keyboard; //input from keyboard

void processVideo(char* outputName);


/**
 * This program detects changes and faces in a room,
 * giving feedback in the form of text (Occupied/Unoccupied)
 * and rectangles (Red for faces, Blue for intruders).
 *
 * @function main
 */
int main(int argc, char* argv[])
{
    cout << "Press ESC or q to end program execution" << endl;
    //Create GUI windows
    namedWindow("Frame");

    //Process Video
    processVideo(argv[1]);

    //destroy GUI windows
    destroyAllWindows();

    return EXIT_SUCCESS;
}

/**
 * @function processVideo
 */
void processVideo(char* outputName)
{
    VideoCapture capture(0); //Create the capture object

    if(!capture.isOpened()){ //error in opening the video input
        cerr << "Unable to open camera" << endl;
        exit(EXIT_FAILURE);
    }

    //Read keyboard input data. ESC or 'q' for quitting
    keyboard = 0;

    capture.read(frame); //First frame

    //Create the output video
    int fourcc = static_cast<int>(capture.get(CV_CAP_PROP_FOURCC));
    VideoWriter outputVideo;
    Size frameSize((int) capture.get(CV_CAP_PROP_FRAME_WIDTH), (int) capture.get(CV_CAP_PROP_FRAME_HEIGHT));
    // outputName = "videos/x.wmv"
    outputVideo.open(outputName, fourcc, 30, frameSize, true);

    while( keyboard != 'q' && keyboard != 27 ){
        //read the current frame
        if(!capture.read(frame)) {
            cerr << "Unable to read next frame." << endl;
            cerr << "Exiting..." << endl;
            exit(EXIT_FAILURE);
        }

        // Show the current frame with respective feedback
        imshow("Frame", frame);

        // Saves the frame (output video)
        outputVideo << frame;

        // Get the input from the keyboard
        keyboard = (char)waitKey( 1 );
    }

    //Delete capture and output object
    capture.release();
    outputVideo.release();
}
