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
        bool verified;
        string bank;
        string publicKey;
    }

    address[] unverified;
    //To store verifier data with key : publickey
    mapping(address => Verifier) Verifiers;

    //From User's unique ID -> Verifier
    mapping(string => string) linkedVerifiers;

    //For User Data
    mapping(string => User) Users;

    function getUnverifiedVerifiers() public view returns (address[] memory) {
        require(msg.sender == owner, "Unauthorized");
        return unverified;
    }

     function getVerifier(address verifierAddress) public view returns(string memory){
        return Verifiers[verifierAddress].bank;
    }


    function getVerifierForUser(string memory _id) public view returns (string memory){
        require(Users[_id].present == true, "User does not exist");
        return (linkedVerifiers[_id]);
    }

    function addVerifier(string memory bankName, address verifierAddress, string memory publicKey) public {
        require(msg.sender == owner,"Unauthorized");
        require(Verifiers[verifierAddress].present == false, "Verifier already exists");
        unverified.push(verifierAddress);
        Verifiers[verifierAddress] = Verifier(true, false, bankName, publicKey);
    }

    function getPublicKey(address verifierAddress) public view returns(string memory){
        return Verifiers[verifierAddress].publicKey;
    }

    function addUser(string memory _id,
                    string memory _signature,
                    string memory _mobileHash,
                    address verifierAddress) public {
        require(
            Users[_id].present == false,
            "User already exist"
         );

        Users[_id] = User(true, _signature, _mobileHash);
        require(Verifiers[verifierAddress].present == true, "Unauthorized verifier");
        linkedVerifiers[_id] = getPublicKey(verifierAddress);
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