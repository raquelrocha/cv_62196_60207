cmake_minimum_required(VERSION 2.8)
project( main )
find_package( OpenCV REQUIRED )

set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -std=c++14")

set(dir ${CMAKE_CURRENT_SOURCE_DIR})
SET(CMAKE_RUNTIME_OUTPUT_DIRECTORY "${dir}/build")

#copy data file to build directory
file(GLOB AVI "${CMAKE_CURRENT_SOURCE_DIR}/videos/*")
file(COPY ${AVI} DESTINATION ${CMAKE_RUNTIME_OUTPUT_DIRECTORY})

#file(GLOB MP4 "${CMAKE_CURRENT_SOURCE_DIR}/videos/*.mp4")
#file(COPY ${MP4} DESTINATION ${CMAKE_RUNTIME_OUTPUT_DIRECTORY})

INCLUDE_DIRECTORIES(${OpenCV_INCLUDE_DIR})

add_executable( App project.cpp)
target_link_libraries( App ${OpenCV_LIBS} )
