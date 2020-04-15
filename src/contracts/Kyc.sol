pragma solidity >=0.4.21 <0.6.0;

contract Kyc {

    address owner;

    constructor() public {
        owner = msg.sender;
    }

    struct User {
        bool present;
        string signature;
        string mobileHash;
    }

    struct Verifier{
        bool present;
        string bank;
        string publicKey;
    }

    //To store verifier data with key : publickey
    mapping(string => Verifier) Verifiers;

    //From User's unique ID -> Verifier
    mapping(string => string) linkedVerifiers;

    //For User Data
    mapping(string => User) Users;

    function getVerfierForUser(string memory _id) public view returns (string memory){
        require(Users[_id].present == true, "User does not exist");
        return (linkedVerifiers[_id]);
    }

    function addVerifier(string memory _bankName, string memory _publicKey) public {
        require(msg.sender == owner,"Unauthorized");
        require(Verifiers[_publicKey].present == false, "Verifier already exists");
        Verifiers[_publicKey] = Verifier(true, _bankName, _publicKey);
    }


    function addUser(string memory _id,
                    string memory _signature,
                    string memory _mobileHash,
                    string memory _verifierKey) public {
        require(
            Users[_id].present == false,
            "User already exist"
         );

        Users[_id] = User(true, _signature, _mobileHash);
        require(Verifiers[_verifierKey].present == true, "Unauthorized verifier");
        linkedVerifiers[_id] = _verifierKey;
    }

    function getUserSignature(string memory _id) public view returns (string memory) {
        require(Users[_id].present == true, "User does not exist");

        return(Users[_id].signature);
    }

    function getUserMobileHash(string memory _id) public view returns (string memory) {
        require(Users[_id].present == true, "User does not exist");

        return (Users[_id].mobileHash);
    }
}